Code for benchmarking should be included in `<script type="module">` inline. (You can skip `type="module"` if your `<script>` is alone on a page otherwise your variables clash.)

Then you should load the benchmark tool's code, you do this either by 
1. With `<script>`:
```
<script src="https://cdn.jsdelivr.net/gh/silentmantra/benchmark/loader.js"></script>
```
2. Directly inside your benchmark code in any place (usually as a last line), good when your benchmark script is alone on a page. It's my preferred way to inject into a stackoverflow code snippet:
```
/*@skip*/ fetch('https://cdn.jsdelivr.net/gh/silentmantra/benchmark/loader.js').then(r => r.text().then(eval));
```

As you see with `/* @skip */` you can exclude a line of code from benchmarked code but execute it initially in `<script>`.

After loading the tool transforms your `<script>` in an UI to show its code and results of your benchmarks and to execute them. The results are displayed as JSON and cut to the first 500 characters or so.

A simple benchmark could be 
1. Some code to execute before each benchmark
2. One or several solutions beginning with 
```
// @benchmark Solution 1
```
where everything following `@benchmark` is the solution's name.

3. The execution result of a solution is the result of the last line (execution is done with `eval()`).

<script type="module">

    const input = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

    // @benchmark Array::reverse()
    input.split('').reverse().join('');

    // @benchmark string concat
    let result = '';
    for(let i = input.length - 1; i >= 0; i--){
      result += input[i];
    }
    result;
    
</script>

After clicking `RUN` the tool estimates how many cycles to run each solution so the average time for a solution would be not less than 100ms and runs each solution 5 times by default (you can change it with the times number input). After running you can copy the results as a markup. So the above benchmark gives:
```
` Chrome/122
------------------------------------------------------
string concat     1.00x | x1000000 399 404 422 435 441
Array::reverse()  3.08x |  x100000 123 124 130 131 139
------------------------------------------------------
https://github.com/silentmantra/benchmark `
```

The first solution is the fastest which is marked as `1x`. The other solutions are marked how they are slower than the top solution. The next column is how many cycles the solution was run, and the next 5 (number of times the solution was run) are milliseconds taken to run the cycles with the minimum time as the first (sorted asc). Basically based on my experience the minimum time is the most presentable value of how good a solution could perform.

You can click and solution and it will marked as `1.00x` and other solutions will be recalculated according the selected. To reset the selection just click outside the result table: 
  
[![enter image description here][1]][1]

You can set the times and cycles manually (sometimes for heavy solutions you could prefer manually setting the cycles to 1):

<script type="module">

    const TIMES = 3, CYCLES = 1000000;
    const input = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

    // @benchmark Array::reverse() xxx
    input.split('').reverse().join('');

    // @benchmark string concat
    let result = '';
    for(let i = input.length - 1; i >= 0; i--){
      result += input[i];
    }
    result;

</script>

Algorithms have different time complexity so it's possible to benchmark solutions with different input size. For that we have 3 variables:
 1. `$chunk` - a chunk from which the input is composed. Could be a string, an array or a function returning either of them.
 2. `$input` - an array or a string to fill with chunks.
 3. `$chunks` - an array of numbers of chunks to run (default `[1, 10, 100, 1000]` - no need to define).

Let's check with a string:

<script type="module">

    const $chunk = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';
    let $input = '';

    // @benchmark count stupid
    {
      const chars = {};
      for(let i = 0; i < $input.length; i++){
        const char = $input[i];
        chars[char] ??= $input.split('').filter(c => c === char).length;
      }
      chars;
    }

    // @benchmark count smart
    {
      const chars = {};
      for(let i = 0; i < $input.length; i++){
        const char = $input[i];
        chars[char] ??= 0;
        chars[char]++;
      }
      chars;
    }
</script>

```
` Chrome/122
--------------------------------------------------------------------------------
>                   n=122      |     n=1220     |    n=12200    |    n=122000   
count smart    1.00x x100k 284 | 1.00x x10k 183 | 1.00x x1k 186 | 1.00x x100 186
count stupid   2.56x x100k 727 | 3.33x x10k 609 | 3.40x x1k 633 | 7.26x  x10 135
--------------------------------------------------------------------------------
https://github.com/silentmantra/benchmark `
```

A top solution is the best with the most input size.

Note that you could use `{}` block to create a block scope to run a solution in it to avoid variable clashing.

With a chunk function:

<script type="module">

    const $chunks = [100, 1000, 10000, 100000];
    const $chunk = () => [Math.random()];
    const $input = [];

    // @benchmark count stupid
    {
      const chars = {};
      const allNums = $input.map(n => n.toString().slice(2)).join('');

      for(let i = 0; i < allNums.length; i++){
        const char = allNums[i];
        chars[char] ??= allNums.split('').filter(c => c === char).length;
      }
      chars;
    }

    // @benchmark count smart
    {
      const chars = {};
      $input.forEach(num => {
        for(const char of num.toString().slice(2)){
          chars[char] ??= 0;
          chars[char]++;
        }
      });
      chars;
    }

</script>

```
` Chrome/122
------------------------------------------------------------------------------
>                  n=100      |    n=1000     |    n=10000     |   n=100000   
count smart    1.00x x10k 172 | 1.00x x1k 191 | 1.00x x100 246 | 1.00x x10 337
count stupid   4.19x x10k 720 | 4.01x x1k 766 | 5.53x  x10 136 | 5.43x  x1 183
------------------------------------------------------------------------------
https://github.com/silentmantra/benchmark `
```

If you need some code executed before the cycles, use `// @run`. For example you could introduce a set of functions/classes used in a solution (initializing them in each cycle is expensive and skews results).

<script type="module">

    const $chunks = [100, 1000, 10000, 100000];
    const $chunk = () => [Math.random()];
    const $input = [];

    // @benchmark count stupid
    {
      const countChars = $input => {
        const chars = {};
        const allNums = $input.map(n => n.toString().slice(2)).join('');

        for(let i = 0; i < allNums.length; i++){
          const char = allNums[i];
          chars[char] ??= allNums.split('').filter(c => c === char).length;
        }
        return chars;
      };
      // @run
      countChars($input);
    }

    // @benchmark count smart
    {
      const countChars = $input => {
        const chars = {};
        $input.forEach(num => {
          for(const char of num.toString().slice(2)){
            chars[char] ??= 0;
            chars[char]++;
          }
        });
        return chars;
      };
      // @run
      countChars($input);
    }

</script>


  [1]: https://i.stack.imgur.com/jGO28.png
<script src="https://cdn.jsdelivr.net/gh/silentmantra/benchmark/loader.js"></script>
<!-- <script type="module" src="http://localhost:8001/benchmark.js"></script> -->