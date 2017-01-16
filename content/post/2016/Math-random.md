+++
description = ''
tags = ['math']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2016-11-24T10:29:28+08:00"
title="Math Random"
+++

<img src="" alt="" id="canvas2img" style="height: 120px; width: 100%; overflow: hidden;" alt="该随机图像由 CANVAS 生成，刷新页面可重新生成">
<canvas id="canvas" style="display: none;"></canvas>
<script>
'use strict';

(function () {
    var image = document.querySelector('#canvas2img');
    var canvas = document.querySelector('#canvas');
    var container = document.querySelector('.post-block');
    var cxt = canvas.getContext('2d');
    var width = container.offsetWidth;
    var height = 120;

    canvas.width = width;
    canvas.height = height;

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            cxt.fillStyle = Math.random() < 0.5 ? 'black' : 'white';
            cxt.fillRect(x, y, x + 1, y + 1);
        }
    }    

    image.src = canvas.toDataURL();
})();
</script>

唐纳德·克努特曾在《计算机程序设计的艺术》（卷二）中指出：“当今使用的大部分随机数生成器都不够优秀，而且开发者倾向于拿来就用，不去了解具体的生成策略。以至于我们常常发现一些略有瑕疵、年代久远的随机数生成器会被盲目地用在一个又一个的程序中，而对于它们的局限性，却无人问津。”

我希望在读过本文之后能够让大家对以下两件事深表认同，虽然其中一件尚存在争议：

- 我们不应该忽视 V8 PRNG（pseudo-random number generator）的局限性，至少应该了解更安全的 CSPRNG（Cryptographically Secure Pseudo-Random Number Generator）
- 当前 V8 引擎中的 `Math.random()` 存在问题

<!-- more -->

Betable（作者所在的公司）的业务非常依赖随机数，最常见的需求就是生成一个随机标识符，而且对这标识符有一个严格的要求：不允许生成同一个标识符两次，也就是杜绝碰撞。

但事实上影响碰撞效果的因素只有两个：

1. 标识符的总量，即有多少种可能性
2. 标识符的生成策略

为了避免基于生日悖论（birthday paradox）的攻击，我们生成的标识符由 64 种字符（数字、大小写字母以及 `-` 和 `_` ）组成 22 位字符串，比如 EB5iGydiUL0h4bRu1ZyRIi 和 HV2ZKGVJJklN0eH35IgNaB。也就是说标识符总共存在 2^132 种可能性，如果每秒会生成一百万个标识符，那么在未来三百年内发生碰撞的几率只有六十亿分之一。

有了足够的标识符之后，我们就要考虑标识符的生成策略。传统方式是使用伪随机数字生成器（PRNG），这一生成器也是许多标准库的选择。因为我们的很多服务是基于 Node.js 构建的，所以会用到 V8 引擎中的 Math.random()，该函数返回一个 `[0, 1)` 之间的数字。

```js
var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

random_base64 = function random_base64(length) {
    var str = "";
    for (var i=0; i < length; ++i) {
        var rand = Math.floor(Math.random() * ALPHABET.length);
        str += ALPHABET.substring(rand, rand+1);
    }
    return str;
}
```

在上面的代码中我们创建了一个包含所有字符的序列，然后基于 Math.random() 的返回值从中随机选取字符，最终拼接成长为 `length` 的标识符字符串。

这一生成策略看起来很完美，直到有一天我们收到了 Nick Forte 的邮件，他在邮件中声称它接收到了两个相同的标识符。这让我们意识到其中必有蹊跷。John von Neumann 曾经毫不留情地指责：“开发者对使用算法生成随机数的自负和执迷不悟，是一切的原罪。”简而言之，确定性的方法无法真实地创造随机性，比如数理运算。这道理听起来矛盾重重似是而非……

## PRNG

从下图演示的随机数生成流程中可以清晰看出，PRNG 算法生成的并不是随机数，而是一种伪随机。对于大多数的使用场景，伪随机的做法并没有错，重点是这种伪随机要足够以假乱真。在伪随机性之外，下图还揭示了另一个问题：周期性循环。虽然周期长短都无法保证伪随机的质量，但长周期显然要好于短周期，如果我们知道周期的存在但无法计算这一周期长度时，那么就可以将其周期上限视为小于等于随机数的数量，这也是一个优秀的 PRNG 算法应具有的特点。

![math-random-prng-2016-04-27](/img/math-random-prng-2016-04-27.png)

接下来，让我们深入分析一下 PRNG 生成的随机序列所存在的缺陷。举例来说，我们需要使用 PRNG 处理 [0, 15] 十六个整数生成类似 `(2, 13, 4)` 和 `(5, 12, 15)` 之类的元组，理论上说应该有 16^3 种可能性，但简单的 PRNG 只会生成少量的非重复结果（这里是 16 种）：

![math-random-prng-2-2016-04-27](/img/math-random-prng-2-2016-04-27.png)

还记得本文最初提到的随机标识符吗？生成标识符的原理就和生成上面的元组一样，最终能够生成的非重复结果就取决于 PRNG 的内部状态和循环周期。

## Math.random()

对于 Nick 在邮件中提到的问题，我们迅速审查了相关的代码逻辑，但并没有找到任何缺陷，这说明问题涉及的技术层面可能会非常深。ECMAScript 规范是这样描述 Math.random() 的：“返回一个整数，该整数的取值范围大于等于 0 而小于 1，浏览器开发商使用自定义的算法或策略从该范围内实现均匀分布的随机或伪随机效果。”

显然，规范中遗漏了大量的细节。首先，它没有定义精度。由于 ECMAScript 使用 IEEE 754 双精度浮点数存储所有数值，所以理论上应该有 53 位的精确度，即随机数的随机范围是 `[1/x^53, 2^53-1]`，但实际上，V8 中的 Math.random() 只有 32 位精度，不过这已经足够我们用的了。

真正的问题是规范放任浏览器开发者自由实现该方法，且没有限制最小的周期长度，唯一对分布的要求也只是“近似均匀”。

## V8 PRNG

```js
var MAX_RAND = Math.pow(2, 32);
var state = [seed(), seed()];

var mwc1616 = function mwc1616() {
    var r0 = (18030 * (state[0] & 0xFFFF)) + (state[0] >>> 16) | 0;
    var r1 = (36969 * (state[1] & 0xFFFF)) + (state[1] >>> 16) | 0;
    state = [r0, r1];

    var x = ((r0 << 16) + (r1 & 0xFFFF)) | 0;
    if (x < 0) {
        x = x + MAX_RAND;
    }
    return x / MAX_RAND;
}
```

上述代码就是 V8 PRNG 的核心逻辑。在老版本的 V8 源码中对此有一段注释：“随机数生成器使用了 George Marsaglia 的 MWC 算法。”根据这段注释，我从谷歌搜索到了以下信息：

- George Marsaglia 是一个毕生致力于 PRNG 的数学家，他还开发了用于测试随机数生成质量的工具 [Diehard tests](https://en.wikipedia.org/wiki/Diehard_tests)
- MWC（multiply-with-carry）是由 Marsaglia 发明的 PRNG 算法，非常类似于 LCG（linear congruential generators，线性同余法），其优势在于生成的循环周期更长，接近于 CPU 的循环周期。

不过，V8 PRNG 与经典的 MWC 生成器并不相同，因为它不是对 MWC 生成器的简单扩展，而是组合使用了两个 MWC 子生成器（r0 和 r1），并最终拼接成一个随机数。这里略过相关的数学计算，只说结论，每个子生成器最长的循环周期长度都是 2^30，合并后为 2^60。

上文提到过，我们定义的标识符有 2^132 种可能性，所以 V8 的 Math.random() 并不能满足这一需求。尽管如此，我们仍使用该函数并假设生成的随机数是均匀分布的，那么生成一亿个标识符后出现碰撞的可能性才只有 0.4%，但现在发生碰撞的时间也太早了，所以我们的分析一定有什么地方出错了。之前已经证明循环周期长度是正确的，那么很有可能生成的随机数不是均匀分布的，一定有其他的结构影响了生成的序列。

## 双子生成器

```js
var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

random_base64 = function random_base64(length) {
    var str = "";
    for (var i=0; i < length; ++i) {
        // Math.random(): ((r0 << 16) + (r1 & 0xFFFF)) | 0
        var rand = Math.floor(Math.random() * ALPHABET.length);
        str += ALPHABET.substring(rand, rand+1);
    }
    return str;
}
```

上面代码中的 `Math.floor(Math.random() * ALPHABET.length)` 一句非常重要，它被用来扩大随机数的范围并取整，同时它也会让最终的随机数丢失低字节，倾向于高字节。究其原因，是因为 V8 的算法在合并两个子生成器的结果时，使用的不是异或计算，而是简单粗暴的拼接。这是非常严重的缺陷。当我们将 Math.random() 的范围扩展到 [0, 64) 并取整后，就已经改变了它的平衡性，更多的倾向于使用高位字节。这些高位字节通常来自于 MWC 子生成器中的第一个生成器。

![math-random-prng-3-2016-04-27](/img/math-random-prng-3-2016-04-27.png)

如果单独分析一下第一个子生成器，就会发现它具有 32 位的内部状态，实际的循环周期长度是 5.9 亿左右（18030*2^15，计算细节请参考文末资料），所以使用这个生成器只能生成 5.9 亿标识符，也就是生成 30000 个标识符后就有超过 50% 的概率发生碰撞。

但如果这是真的话，那么在生成标识符之后不久就会发生碰撞。为了理解这一现象，想想我们之前生成元组的示例，在这个示例中也没发生生日悖论，这是因为这个序列根本不是随机的，所以不能假装它是。V8 PRNG 和我们的随机标识符也是同样的道理，在特定条件下，PRNG 的伪随机性反倒不易生成碰撞。

![math-random-prng-2016-04-27](/img/math-random-prng-2-2016-04-27.png)

虽然在这种场景下生成器对我们的需求有益，但既然存在错误，我们就应该寻求更高质量的 PRNG，一个有效的方式就是让生成器的循环周期长度远大于随机数的可能性。这里有一个启发式的方法：如果需要生成具有 n 中可能性的随机数，那么就需要一个循环周期长度为 n^2 的 PRNG（相关细节请参考 Pierre L'Ecuyer 的 [random number generation](http://www.iro.umontreal.ca/~lecuyer/myftp/papers/handstat.pdf)）。

对于我们所遇到的问题，可以说是过于关注序列的重叠度，而忽视统计随机性了。如果一个生成器要生成 n 个长度为 l 的序列，且循环周期长度为 p，那么其重叠概率就是 `[1-(nl)/(p-1)]^(n-1)`，或当 p 足够大时接近 ln^2/p（相关细节请参考文末资料）。这告诉我们需要一个相当大的循环周期，否则序列的随机性就会变得脆弱。

简而言之，如果你正在使用 V8 的 Math.random() 生成随机数序列，那么为了保证随机性，序列长度应该小于 24000；如果想避免碰撞，那么应该选择其他的方法生成随机序列。

## MWC1616

Marsaglia 在 1997 年提出了 MWC1616，他认为该方法可以通过所有的随机性测试。不幸的是，他在九十年代末使用的 Diehard tests 并不符合今天的标准。如果使用更加现代的测试框架测试，就会发现该算法在当时问题百出。

```js
// January 12, 1999 / V8 PRNG: ((r0 << 16) + (r1 ^ 0xFFFF)) % 2^32
var x = ((r0 << 16) + (r1 & 0xFFFF)) | 0;

// January 20, 1999: (r0 << 16) + r1) % 2^32
var x = ((r0 << 16) + r1) | 0;
```

就我所知，拼接子生成器的结果创造随机数并没有什么数学方面的依据，最常见的都是使用模运算进行合并。Marsaglia 在 Usenet 发布了 MWC1616 之后也意识到了这个问题，所以在 1999 年 1 月 12 日又发布了如今被 V8 所有的  MVC1616 版本。八天之后，他又发表了另一个不同的版本。新版本对于两个子生成器的合并更加均衡。

这两个版本的 MWC1616 都被其他程序引用了，所以就出现了误解。1 月 20 日的 MWC1616 的基数被标记为 b = 2^16，且被注释为仅限用于 32 位的算术。当你使用该版本的时候，会被警告替换该算法，但实际上它比 V8 Math.random() 中适用的 MWC 要好。此外更令人不解的是，1 月 20 日的 MWC1616 被维基百科作为随机数生成的示例演示，而 TestU01 中包含了两种 1 月 12 日 MWC1616 的实现，一个是 MWC1616，一个是 MWC97R。

希望这篇文章可以提醒开发者，并强化 Knuth 的观察结果：

- 通常来说，PRNG 存在瑕疵，开发者应该具体情况具体分析，理解这些算法的局限性
- 特别的，不要使用 MWC1616，它并不够好

## CSPRNG

为了修复我们的标识符生成器，需要一种解析速度快、可替代 Math.random() 的方法。虽然有很多 JavaScript 的 PRNG 实现可用，但我们主要针对以下几点查找这一方法：

- 循环周期长，远大于标识符的 2^132 种可能性
- 有良好的支持且经得起测试

幸运的是，Node.js 的标准库提供了另一个 PRNG 就满足这两点要求：`crypto.randomBytes()`，一个密码学安全伪随机数生成器（CSPRNG）。如果是在浏览器上，也可以使用 `crypto.getRandomValues()` 实现。

但这并不是完美的通用解决方案，有以下三个原因：

- CSPRNG 通常是非线性变换，慢于非密码的解决方案
- 许多 CSPRNG 系统不支持种子状态，进而使得序列结果不可复现
- CSPRNG 强调不可预测性重于质量

不过：

- 速度是相对的，CSPRNG 对大多数使用场景来说都是很快的
- 对于不可预测，这也让我们无法区分真正的随机性，也就是我们想要的伪随机性序列
- 以“安全加密”为主打的生成器往往代码审查更严格且随机性测试更全面

如果你无法信任非加密方案的质量，或者除非使用既定的收发方案保证质量，使用 CSPRNG 都是你最好的选择。如果你不信任标准库中的 CSPRNG，那么可以使用由 kenel 维护的 [urandom](http://sockpuppet.org/blog/2014/02/25/safely-generate-random-numbers/)。

我无法告诉你 `crypto.randomBytes()` 的确切循环周期，是因为还没人遇到过这一问题，我只能说它很安全。如果你相信 OpenSSL 生成的公钥和私钥的安全性，那么就没有理由不相信它。在实际开发中，使用 `crypto.randomBytes()` 可以轻松解决 `Math.random()` 的问题。

实际上，Chrome 也可以令 Math.random() 调用 crypto.randomBytes() 中使用的 CSPRNG，详见 [what Webkit is doing](http://trac.webkit.org/browser/trunk/Source/WTF/wtf/RandomNumber.cpp#L41)。也即是说，有很多安全且高质量的非加密方案。

## V8's PRNG

我的目标是说服你 V8 的 Math.random() 有瑕疵且应该被替换。到目前为止我们已经发现它规律性的输出、在测试上的失败以及真实环境的低性能等问题。如果你期待更多的证据，那就看以下图片吧（译者注：以下图片演示的问题可能已被修复）：

![/img/20160428-math-random-csprng.png](/img/20160428-math-random-csprng.png)

此时你应该认可 V8 中的 Math.random() 存在缺陷且应该被修复了吧。那么问题来了，我们应该如何修复它呢？虽然修复很简单，但是继续使用 MWC 显然是无意义的，我们有更好的选择。

下面列出了我们对随机数生成器的要求：

- 随机数空间大，种子状态多——理想情况下，要大于 1024 位，因为这是其他生成器保证质量的上限。对于 2^1024 种可能性，足以满足 99.9% 的需求了，且具有强大的安全性
- 速度至少要和当前的实现保持一致
- 高效的内存使用率
- 循环周期药厂，任何大于 2^50 周期长度的生成器都是可用的，大于 2^100 则可让伪随机性以假乱真
- 经得起随机性测试

当前有许多 PRNG 算法满足或远超上述要求。[Xorshift](https://en.wikipedia.org/wiki/Xorshift) 速度快且耐得住严格的统计测试。xorgens4096 是 xorshift 的变体，基于 JavaScript 开发实现，它有 4096 位状态空间，循环周期长达 2^4096，并且比 Chrome 中的 MWC16 运行速度更快。此外，它能够无系统故障地通过 BigCrush 的测试。

最近的实践表明，使用 xorshift 生成的结果乘以常量的结果也可以通过 BigCrush 对非线性转换生成器的测试。此类生成器被称为 xorshift\*，它们解析速度快、易于时间且内存使用效率高，其中 xorshift102\* 就满足甚至超过以上的全部要求。如果内存占用问题严重，也可以使用 xorshift64\*，它比 MWC1616 的内存占用率相同，但循环周期更长、解析更快。另一个线性和非线性的混合生成器是 PCG，它声称具有和 xorshift\* 具有相似的性能和质量。

所以说我们有许多可选择的算法，其中，最安全的选择也许就是标准的 Mersenne Twiste（马特赛特旋转演算法）。该算法最受欢迎的变体 MT19937 诞生于九十年代末，从那时开始它就成为了许多软件标准的随机数生成策略。它并不是完美的，但久经考验和分析，且易于理解。值得炫耀的是，它的循环周期长达 2^19937-1，基本上不会发生碰撞，但使用该算法会强制要求 2KB 的状态空间和相应的内存占用、性能消耗。虽然无法解释，但它和 Chrome 中 Math.random() 的执行速度一样快。

所以我的建议就是 V8 应该考虑一下 Dean McNamee 六年前的建议，使用马特赛特旋转演算法实现 Math.random() 了。它解析速度快、健壮且安全，对不了解 PRNG 运行机制的开发者也是安全无害的。当然也可以选择其他方案，但请不要再使用 MWC1616 了！

## Summary

本文也是够长的，我们总结一下：

- V8 中的 Math.random() 使用的 PRNG 算法是 MWC1616。如果你只使用 16 位，那么它的循环周期长度就会很短。通常来说，它在质量测试中的表现很差，对于大多数的重要场景，它所伪造的随机性是不安全的。
- 如果你没时间实现非加密的方案，那就直接使用 CSPRNG 吧。最安全的的方式就是使用 [urandom](http://sockpuppet.org/blog/2014/02/25/safely-generate-random-numbers/)。在浏览器环境中，可以使用 `crypto.getRandomValues()`。
- 也有许多比 MWC1616 速度更快、质量更高的非加密 PRNG 算法。V8 应该使用它们重新实现 Math.random()。Mersenne Twiste 可以说是最受欢迎的方案了，有可能也是最安全的方案。

注意，Mozilla 中使用了来自 Java 的 util.Random 包，且略差于 MWC1616，所以 SpiderMonkey 也应该升级相关方法。

###### 参考资料

- [http://digitalcommons.wayne.edu/cgi/viewcontent.cgi?article=1725&context=jmasm](http://digitalcommons.wayne.edu/cgi/viewcontent.cgi?article=1725&context=jmasm)
- [https://en.wikipedia.org/wiki/Multiply-with-carry#General_theory](https://en.wikipedia.org/wiki/Multiply-with-carry#General_theory)
- [http://xorshift.di.unimi.it/](http://xorshift.di.unimi.it/)
- [http://www.mathpages.com/home/kmath580/kmath580.htm](http://www.mathpages.com/home/kmath580/kmath580.htm)
