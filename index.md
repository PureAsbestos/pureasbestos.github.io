---
title: Home
layout: default
description: >
   The personal website of PureAsbestos.
   Find pixel art, programming projects, blog posts, and more, all in one place!
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean fermentum sollicitudin mauris, sit amet tristique nisl. Pellentesque fringilla luctus mi, eget hendrerit sapien congue vitae. Cras porta tortor id orci semper, eu cursus orci commodo. Etiam gravida mauris nec ipsum tempor, eu malesuada mi placerat. Praesent rutrum porttitor lorem, iaculis tempor libero fermentum sed. Aenean a sem ornare, interdum nibh vel, iaculis massa. Morbi consequat arcu eu metus maximus, vel bibendum odio elementum. Donec et blandit diam. Morbi ultrices, lorem ut hendrerit sollicitudin, libero nibh venenatis orci, nec placerat felis libero vel urna. Aliquam nec nulla eros. Donec quam arcu, pharetra sit amet auctor at, imperdiet quis mi. Praesent finibus purus non sagittis posuere. Morbi id sagittis eros, sit amet sagittis dui. Sed at aliquam ex, in tempor neque.

`Single code line`

Maecenas auctor sagittis magna, ut laoreet sem cursus nec. Nulla faucibus elit quis libero tincidunt, vitae rhoncus nibh hendrerit. Morbi lacinia maximus arcu quis consequat.

```python
# Program to display the Fibonacci sequence up to n-th term

nterms = int(input("How many terms? "))

# first two terms
n1, n2 = 0, 1
count = 0

# check if the number of terms is valid
if nterms <= 0:
   print("Please enter\na positive integer")
# if there is only one term, return n1
elif nterms == 1:
   print("Fibonacci sequence up to ", nterms, ":")
   print(n1)
# generate fibonacci sequence
else:
   print("Fibonacci sequence:")
   while count < nterms:
       print(n1)
       nth = n1 + n2
       # update values
       n1 = n2
       n2 = nth
       count += 1

class Foo(something):
   bar = ""
   def beans(bacon, lard="food"):
      bar = bacon + beans
      Foo.beans()
      eggs = Foo()

   def __init__(self):
      pass

```

Etiam vehicula vestibulum leo sit amet accumsan. Proin sapien enim, dapibus in nisi fringilla, dapibus iaculis ante. Maecenas semper eros ipsum, efficitur bibendum sem pellentesque ac. Nam id sapien leo. Aliquam imperdiet, ex quis commodo eleifend, augue sapien aliquet enim, ac dictum enim ante dapibus massa.
