# series-plotter
With this tool, you can visualize any series of real numbers or series of real functions.

## Compatibility
This project uses JavaScript Modules. So in order to use the program, you have to access the webapp via **http** or **https**.
Modules are supported by every modern web browser. The current version is available under https://tobostus.github.io/series-plotter.
In case you want to self-host a copy of this program, we recommend using [VSCode](https://code.visualstudio.com/) with Ritwick Dey's Extension **Live Server**.

## User interface
*This program is optimized for use with [Firefox](https://www.mozilla.org/de/firefox/new/). Other browsers might render elements in an unsightly way.*

When you first open the page, you are greeted with this user interface (an English version might be added in a later update):

![Screenshot](/images/Screenshot_with_numbers.png)

1. A drop-down list where you can select the type of series, e.g. "Reelle Funktionenfolgen" (_series of real functions_).

2. This is where you put the series you want to visualize. You can find the necessary [syntax](#syntax-1) [here](#syntax-1). To add a series, click the button
with the **+**. You can remove a series by clicking ![Trash](/images/Delete_button_inline.png). You can also hide or unhide a certain
series with ![Eye](/images/Hide_button_inline.png). The circle to the left of a series is a color picker that lets you change the color of the dots and lines associated with each series.

3. A drop-down list where you can select the type of visualization, e.g. "Zeitliche Darstellung" (_temporal visualization_).

4. In this panel, you can change additional [settings](#options). Depending on the selections in 1. and 3., there will be different [options](#options). For more details, see [Options](#options).

5. This is the canvas: All your series will be drawn on it once you click on "Rendern starten!" (_start rendering_). For more details about [navigation](#navigation-1) on the canvas, see [Navigation](#navigation-1).

6. With the button in the top right corner, you can change the color theme between dark mode and light mode.

On mobile devices or in slim browser windows, the user interface changes into vertical mode. The layout changes slightly, but the functionality remains unchanged.

## Navigation
To adjust the coordinate system to your liking:
| | Mouse gestures | Touch gestures | More options |
| :-----: | :-----: | :-----: | :-----: |
| Move the visible section | Drag your cursor across the canvas. | Drag your finger across the canvas. | Set lower and upper bounds for $n$ or $x$ using the text fields. |
| Scale both axes | Put your cursor where the center of the scaling should be (inside the canvas). Then scroll with your mouse wheel. | Put two fingers inside the canvas and use pinch-to-zoom diagonally. | - |
| Scale the $x$-axis | Shift + mouse wheel | Horizontal pinch-to-zoom | Set lower and upper bounds for $n$ or $x$ using the text fields. |
| Scale the $y$-axis | Ctrl  + mouse wheel | Vertical pinch-to-zoom | - |
| Reset the coordinate system | Double-click on the canvas. | Double-tap on the canvas. | - | 

## Options

| | Räumliche Darstellung (_spatial visualization_) | Zeitliche Darstellung (_temporal visualization_) |
| :-----: | :-----: | :-----: |
| **Koordinatensystem** (_coordinate system_) | Hides or shows the coordinate system as well as guiding lines. | Hides or shows the coordinate system as well as guiding lines. |
| **Verbindungslinien** (_connecting lines_) | The lines connect two consecutive members of the series each ($n$ and $n+1$). | The lines also connect $n$ and $n+1$, but in this case, for a series of real functions $a_x(n)$ and a fixed $x$, that means: Every line represents the directional vector $(0,\,a_x(n+1) - a_x(n))$ moved to $(x,\,a_x(n))$. |
| **Interpolation** (_interpolation_) | - | Linearly interpolates positions for the points inbetween $n$ and $n+1$. This makes it easier to see where certain points are moving when incrementing $n$. Basically, the point just traces its directional vector $(0,\,a_x(n+1) - a_x(n))$. |
| **Animationsdauer** (_animation duration_) | - | How long an increment ($n$ to $n+1$) takes. The set value for the duration approximates the amount of frames a transition needs. So lower means faster animation. |
| **Dynamische Auflösung** (_dynamic resolution_) | If the domain used for $n$ is large, one point per $n$ creates lag. That's why this option omits some values for $n$. | - |
| $x$**-Auflösung** (*resolution in* $x$) | - | If you are visualizing series of real functions, you can set the resolution of the $x$-axis with this (meaning how big the spacing between sampling points should be, starting at $x=0$). |

_Warning: All calculations are performed on your personal device. You should consider the capabilities of your hardware when choosing settings. This especially applies to **Dynamische Auflösung** (dynamic resolution) and_ $x$***-Auflösung** (resolution in* $x$*).*

## Syntax
The required syntax for each function can be found in this table:

| LaTeX | Syntax | Description |
| :-----: | :-----: | :-----: |
| $$n$$ | n | Index $n\in\mathbb{N_{0}}$ of the series |
| $$x$$ | x | Variable $x\in\mathbb{R}$ of the function |
| $$10$$ | 10 | Integer $a\in\mathbb{Z}$ |
| $$3.14$$ | 3.14 _or_ 3,14 | Decimal number $a\in\mathbb{Q}$ |
| $$a+b\cdot i$$ | a+bi _or_ a+b*i | Complex number $a+b\cdot i\in\mathbb{C}$ |
| $$\pi$$ | pi _or_ Pi _or_ PI | Pi ($\pi$) |
| $$e$$ | e _or_ E | Euler's number $e$ |
| $$f+g$$ | f + g | Addition |
| $$f-g$$ | f - g | Subtraction |
| $$f\cdot g$$ | f * g | Multiplication |
| $$a\cdot x$$ | ax _or_ a*x | Multiplication with a constant $a$ |
| $$\frac{f}{g}$$ | f / g | Division |
| $$(f)$$ | (f) | Brackets |
| $$f^a$$ | f^a | Exponentiation |
| $$\sum_{k=m}^{n}{a}$$ | sum(m; n; a; k) | Sum |
| $$\prod_{k=1}^{n}{a}$$ | prod(1; n; a; k) _or_ product(1; n; a; k) | Product |
| $$\int_{a}^{b}{f \ \mathrm{d}x}$$ | int(a; b; f; x) _or_ integral(a; b; f; x) | Integral |
| $$\|x\|$$ | abs(x) _or_ \|x\| | Absolute value |
| $$\mathrm{sgn}(x)$$ | sign(x) | Sign |
| $$\lfloor x\rfloor$$ | floor(x) | Rounding down |
| $$\lceil x\rceil$$ | ceil(x) | Rounding up |
| $$\exp(x)$$ | exp(x) | Exponential function |
| $$\ln(x)$$ | ln(x) | Natural logarithm |
| $$\log_{10}(x)$$ | lg(x) | Common logarithm |
| $$\log_{b}(x)$$ | log(x; b) | Logarithm to base $b$ |
| $$\sqrt{x}$$ | sqrt(x) | Square root |
| $$\sin(x)$$ | sin(x) | Sine |
| $$\cos(x)$$ | cos(x) | Cosine |
| $$\tan(x)$$ | tan(x) | Tangent |
| $$\cot(x)$$ | cot(x) | Cotangent |
| $$\arcsin(x)$$ | arcsin(x) | Arc sine |
| $$\arccos(x)$$ | arccos(x) | Arc cosine |
| $$\arctan(x)$$ | arctan(x) | Arc tangent |
| $$\mathrm{acot}(x)$$ | acot(x) | Arc cotangent |
| $$\sinh(x)$$ | sinh(x) | Hyperbolic sine |
| $$\cosh(x)$$ | cosh(x) | Hyperbolic cosine |
| $$\tanh(x)$$ | tanh(x) | Hyperbolic tangent |
| $$\coth(x)$$ | coth(x) | Hyperbolic cotangent |
| $$\Re(x)$$ | re(x) | Real part |
| $$\Im(x)$$ | im(x) | Imaginary part |
| $$\bar{x}$$ | conj(x) | Complex conjugate |

_Note: If you use_ $x$ _in a series of real numbers, if will be set to_ $0$.

## Contributers
* [Tobostus](https://github.com/Tobostus)
* [Jan Ole Egbers](https://github.com/Jan-Ole-Egbers)

## License
This project is licensed under the GNU GPL-3.0 license - see the [LICENSE](LICENSE) file for details.