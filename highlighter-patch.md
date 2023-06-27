---
category: tech
date: '2022-08-30 05:12:18 +0900'
redirect_from:
  - /coding/customize-syntax-highlight-for-kramdown-of-jekyll
---
# Enable `Rouge::Formatters::HTMLLinewise` for Jekyll v4 syntax highlight

[source](https://blog.kpherox.dev/tech/customize-syntax-highlight-for-kramdown-of-jekyll.html)

Now that GitHub Pages can be deployed from Actions and `ruby/setup-ruby` can be used to freely use `_plugins`, I've made a monkey patch to use `Rouge::Formatters` which requires a non-Hash argument that is not available in plain Kramdown.

<!--more-->

`Rouge::Formatters::HTMLLegacy`, which is used by default, calls `Rouge::Formatters::HTMLTable` when adding line numbers and lays out with `<table>`, so code blocks become hierarchical like `pre > code table tbody pre`, and line numbers are included as text instead of element attributes, resulting in messy markup. So I want to use `Rouge::Formatters::HTMLLinewise`.


## Environment
- jekyll (4.2.2)
- kramdown (2.4.0)
- rouge (3.30.0)

## Markup

### Initial Setup

```yaml?filename=_config.yml
markdown: kramdown
highlighter: rouge

kramdown:
  input: GFM
  syntax_highlighter: rouge

  syntax_highlighter_opts:
    css_class: highlight
    block:
      formatter: HTMLLinewise
      tag_name: span
      class: line
```

````md?filename=index.md
---
layout: default
---

```
sample
code block
```
````

Since only block needs a line number, specify HTMLLinewise for `:formatter` in `:kramdown, :syntax_highlighter_opts, :block` and set `:tag_name` and `:class`.

```terminal?prompt=$
$ bundle exec jekyll build --trace
Configuration file: ./sample-jekyll/_config.yml
            Source: ./sample-jekyll
       Destination: ./sample-jekyll/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 
  Conversion error: Jekyll::Converters::Markdown encountered an error while converting 'index.md':
                    undefined method `stream' for {:css_class=>"highlight", :default_lang=>"plaintext", :guess_lang=>true, :formatter=>"HTMLLinewise", :tag_name=>"span", :class=>"line"}:Hash @formatter.stream(line_tokens) {|formatted| yield formatted } ^^^^^^^ Did you mean? store
bundler: failed to load command: jekyll (/usr/local/lib/ruby/gems/3.0.0/bin/jekyll)
/usr/local/lib/ruby/gems/3.0.0/gems/rouge-3.30.0/lib/rouge/formatters/html_linewise.rb:16:in `block in stream': undefined method `stream' for {:css_class=>"highlight", :default_lang=>"plaintext", :guess_lang=>true, :formatter=>"HTMLLinewise", :tag_name=>"span", :class=>"line"}:Hash (NoMethodError)

          @formatter.stream(line_tokens) {|formatted| yield formatted }
                    ^^^^^^^
Did you mean?  store
	from /usr/local/lib/ruby/gems/3.0.0/gems/rouge-3.30.0/lib/rouge/formatter.rb:99:in `block (2 levels) in token_lines'
// ...
	from /usr/local/lib/ruby/gems/3.0.0/gems/kramdown-2.4.0/lib/kramdown/converter/syntax_highlighter/rouge.rb:34:in `call'
```

We can't use this because it passes `:syntax_highlighter_opts` to `Rouge::Formatters::HTMLLinewise.new/1`.


### Apply a monkey patch to `Kramdown::Converter::SyntaxHighlighter::Rouge`

Change `formatter_class(opts).new(opts)` in `Kramdown::Converter::SyntaxHighlighter::Rouge.call/5`([rouge.rb#L24-L35](https://github.com/gettalong/kramdown/blob/REL_2_4_0/lib/kramdown/converter/syntax_highlighter/rouge.rb#L24-L35)) to `.singleton_class.prepend/1`.

```ruby?filename=_plugins/kramdown-syntax-highlight-patch.rb
require 'kramdown/converter/syntax_highlighter/rouge'

module KramdownSyntaxHighlighterFix
  def call(converter, text, lang, type, call_opts)
    opts = options(converter, type)
    call_opts[:default_lang] = opts[:default_lang]
    return nil unless lang || opts[:default_lang] || opts[:guess_lang]

    lexer = ::Rouge::Lexer.find_fancy(lang || opts[:default_lang], text)
    return nil if opts[:disable] || !lexer || (lexer.tag == "plaintext" && !opts[:guess_lang])

    opts[:css_class] ||= 'highlight'
    formatter = new_formatter(formatter_class(opts), opts) # initialize 呼び出しを包む
    formatter.format(lexer.lex(text))
  end

  # 既知の Rouge:Formatters の initialize 引数の形式で出し分ける
  def new_formatter(formatter, opts)
    case
    when "Rouge::Formatters::HTMLInline" === formatter.to_s
      formatter.new(opts.fetch([:inline_theme], 'github'))

    when ["Rouge::Formatters::Terminal256",
          "Rouge::Formatters::TerminalTruecolor"].include?(formatter.to_s)
      opts[:theme] ? formatter.new(opts[:theme]) : formatter.new()

    when "Rouge::Formatters::HTMLPygments" === formatter.to_s
      formatter.new(base_formatter(opts), opts.fetch(:css_class, 'codehilite'))

    when ["Rouge::Formatters::HTMLTable",
          "Rouge::Formatters::HTMLLinewise",
          "Rouge::Formatters::HTMLLineTable",
          "Rouge::Formatters::HTMLLineHighlighter"].include?(formatter.to_s)
      formatter.new(base_formatter(opts), opts)

    else
      # Rouge::Formatter
      # Rouge::Formatters::HTML
      # Rouge::Formatters::HTMLLegacy
      # Rouge::Formatters::Tex
      # Rouge::Formatters::Null
      formatter.new(opts)
    end
  end

  def base_formatter(opts)
    opts[:inline_theme] ? Rouge::Formatters::HTMLInline.new(opts[:inline_theme])
                        : Rouge::Formatters::HTML.new
  end
end

Kramdown::Converter::SyntaxHighlighter::Rouge.singleton_class.prepend(KramdownSyntaxHighlighterFix)
```

This generates an index.html with each line enclosed in `<span class=line>` `\n</span>`.

```terminal
$ bundle exec jekyll build --trace
Configuration file: ./sample-jekyll/_config.yml
            Source: ./sample-jekyll
       Destination: ./sample-jekyll/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 
     Build Warning: Layout 'default' requested in index.md does not exist.
                    done in 0.134 seconds.
 Auto-regeneration: disabled. Use --watch to enable.
```

```html?filename=_site/index.html
<div class="language-plaintext highlighter-rouge"><span class="line">sample
</span><span class="line">code block
</span></div>
```


### `Rouge::Formatters::HTMLPygments` wrap

Use HTMLPygments to enclose it in `<pre><code>`. If `Rouge::Formatters::HTMLLegacy` sets `:wrap`, it uses HTMLPygments at the very end, so do the same.

```diff
--- a/_config.yml
+++ b/_config.yml
@@ -11,3 +11,4 @@
       formatter: HTMLLinewise
       tag_name: span
       class: line
+      wrap: true
```

```diff
--- a/_plugins/kramdown-syntax-highlighter-rouge-patch.rb
+++ b/_plugins/kramdown-syntax-highlighter-rouge-patch.rb
@@ -11,6 +11,9 @@
 
     opts[:css_class] ||= 'highlight'
     formatter = new_formatter(formatter_class(opts), opts) # initialize 呼び出しを包む
+    if opts[:wrap] && !formatter.is_a?(Rouge::Formatters::HTMLPygments)
+      formatter = Rouge::Formatters::HTMLPygments.new(formatter, opts.fetch(:css_class, 'codehilite'))
+    end
     formatter.format(lexer.lex(text))
   end
 
```

The result will be entered, enclosed by `div.highlight pre.highlight code`:

```html?filename=_site/index.html
<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="line">sample
</span><span class="line">code block
</span></code></pre></div></div>
```

### Display line numbers even in unsupported languages

```diff
--- b/_plugins/kramdown-syntax-highlighter-rouge-patch.rb
+++ c/_plugins/kramdown-syntax-highlighter-rouge-patch.rb
@@ -7,7 +7,9 @@
     return nil unless lang || opts[:default_lang] || opts[:guess_lang]
 
     lexer = ::Rouge::Lexer.find_fancy(lang || opts[:default_lang], text)
-    return nil if opts[:disable] || !lexer || (lexer.tag == "plaintext" && !opts[:guess_lang])
+    return nil if !lexer && !lang
+    return call(converter, text, nil, type, call_opts) unless lexer
+    return nil if opts[:disable] || (lexer.tag == "plaintext" && !opts[:guess_lang])
 
     opts[:css_class] ||= 'highlight'
     formatter = new_formatter(formatter_class(opts), opts) # initialize 呼び出しを包む
```

Fallback to `:default_lang` when `Rouge::Lexer` returns `nil` in an unsupported language.


## Styling

The HTML output is now complete, so all that's left is to adjust the display of line numbers, etc. with CSS.

### Line numbers

When I previously wrote an article on how to [add line numbers to pre so it doesn't move with scrolling](2018-10-12-add-line-number-to-pre-tag.md), I said
> I think it would be easier to enclose each line in `span` and display the number of lines with a counter, so that I don't have to look up the number of lines.

The CSS can be implemented as I described it then. Nested element selectors are a pain, so we'll use the SCSS format to describe them.

```scss
$padding-y: 0.3em;
$padding-x: 1ex;

div.highlighter-rouge > div.highlight > pre.highlight {
  counter-reset: line-number; // reset counter every time you hit a code block

  overflow: auto;
  overscroll-behavior: none; // scroll to the end so that line numbers don't move

  > code > span.line {
    counter-increment: line-number; // increment counter for each row
    padding-right: $padding-x;

    &::before {
      content: counter(line-number); // output the counter

      text-align: right;

      position: sticky; // fixed line number
      inset: 0;

      display: inline-block;
      box-sizing: border-box;
      width: 5ex;
      padding-right: 1ex;

      margin-right: $padding-x;
    }

    &:first-child::before {
      padding-top: $padding-y;
    }

    &:last-child::before {
      padding-bottom: $padding-y;
    }
  }
}
```

In an environment where no CSS is applied at all, the line numbers will be properly numbered, and if you specify `background-color` and `color` for `pre` and `span.line::before`, it will be displayed nicely without any gaps.

#### Toggle display of line numbers

Since it is undesirable to have line numbers in non-file environments such as `.language-console`, however, we will apply the styling without line numbers first, and then ignore unnecessary languages with the `:not()` pseudo-class.

```scss
$padding-y: 0.3em;
$padding-x: 1ex;

div.highlighter-rouge {
  > div.highlight > pre.highlight {
    padding: $padding-y $padding-x;

    overflow: auto;

    > code {
      padding: 0;
      margin: 0;

      > span.line {
        padding-right: $padding-x;
      }
    }
  }

  &:not(.language-console):not(.language-terminal) > div.highlight > pre.highlight {
    counter-reset: line-number; // reset counter every time you hit a code block

    padding: 0; // reset padding. do not add padding to line numbers.

    overscroll-behavior: none; // scroll to the end so that line numbers don't move

    > code > span.line {
      counter-increment: line-number; // increment counter for each row

      &::before {
        content: counter(line-number); // output the counter

        text-align: right;

        position: sticky; // fixed line number
        inset: 0;

        display: inline-block;
        box-sizing: border-box;
        width: 5ex;
        padding-right: 1ex;

        margin-right: $padding-x;
      }

      &:first-child::before {
        padding-top: $padding-y;
      }

      &:last-child::before {
        padding-bottom: $padding-y;
      }
    }
  }
}
```

This will stop the line numbers from being displayed only when using console.


## Conclusion
By patching Kramdown to use HTMLLinewise, Jekyll can now statically output variable-length line numbers. I'm glad that I can deploy the results of GitHub Actions `bundle exec jekyll build` as they are, and to be able to use this crude solution.

I don't think monkey patching is a good idea, so I think the best way would be to implement Formatter's protocol properly and throw it in Rouge, so if you feel like it, try it.
