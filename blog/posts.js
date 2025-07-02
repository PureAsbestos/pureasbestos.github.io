// const documents = fetch('posts.json');

// import posts from './posts.json' with { type: 'json' }
// console.log(document.getElementById('posts-json').textContent);
// const posts = JSON.parse(document.getElementById('posts-json').textContent);

const POSTS = await (await fetch('posts.json')).json();

// Create a search engine that indexes the 'title' and 'text' fields for
// full-text search. Search results will include 'title' and 'category' (plus the
// id field, that is always stored and returned)
const miniSearch = new MiniSearch({
  fields: ['title', 'text', 'tags'],
  storeFields: ['url', 'title', 'blurb', 'date', 'date_text', 'tags']
});

// Add documents to the index
miniSearch.addAll(POSTS);



const searchbar = document.getElementById('blogsearchbar');
const bloglist = document.body.getElementsByClassName('bloglist')[0];


searchbar.addEventListener('input', (event) => {
  
  const query = searchbar.value;

  const searchOptions = {
    fuzzy: 0.2,
    prefix: true
    // filter: null,
    // boost: { artist: -20, title: 20 }
  };
  
  clearResults();
  if (query) {
    // Search for documents:
    let results = miniSearch.search(query, searchOptions);
    addResults(results);
  } else {
    addResults(POSTS);
  }

});


function clearResults() {
  bloglist.innerHTML = '';
}


function addResults(results) {
  for (const result of results) {
    let item = buildPostNode(result);

    bloglist.appendChild(item);
  }
}


function buildPostNode(post) {
  let article = document.createElement('article');
  article.classList.add('blogitem');
  
  article.innerHTML = `
  <hgroup>
    <h2><a href="${ post.url }">${ post.title }</a></h2>
    <time datetime="${ post.date }">${ post.date_text }</time>
  </hgroup>
  ${ post.blurb } <a href="${ post.url }">...</a>
    <ul class="blogtaglist"><li>${ post.tags.join("</li><li>") }</li></ul>`

  return article;
}



// => [
//   { id: 2, title: 'Zen and the Art of Motorcycle Maintenance', category: 'fiction', score: 2.77258 },
//   { id: 4, title: 'Zen and the Art of Archery', category: 'non-fiction', score: 1.38629 }
// ]