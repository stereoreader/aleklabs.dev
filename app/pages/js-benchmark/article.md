> Premature optimization is the root of all evil -- Donald Knuth

In light of modern trends of increasing complexity of modern JS frameworks, high end developer hardware and the premature optimization mantra we ended up with some performance problems with modern web and especially modern mobile web (deserves a separate article). 

Probably you can't comfortably use modern web sites on a 5 year old mid/low budget device, at least the most people don't expect to upgrade their PCs used just for web surfing every year. I've ended up buying a high end android phone just to use social sites comfortably. 

One could tell that a user couldn't tell a difference between 1 and 5 ms, but given the fact we could have hundreds of operations on page or data loading, all these small overheads lead to a noticeable performance hit and poor user experience.

So I'd say that every millisecond matters in Javascript. Premature optimization is bad when you spend significant amount of time on a code piece that is thrown away later due refactoring. But what if you could write highly performant Javascript code from the beginning? You just don't need to optimize later and the whole premature optimization thing isn't relevant anymore. So learn how to write fast Javascript, I believe it will pay off.

In the next posts that would form a series I will be collecting tips how to write fast Javascript.
