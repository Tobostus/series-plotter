# series-plotter
With this tool, you can visualize any series of real numbers or series of real functions.

## Access
The current version is available under https://tobostus.github.io/series-plotter.

### Installing the PWA
You can also install the tool as a [Progressive Web App](https://en.wikipedia.org/wiki/Progressive_web_app) (PWA) using supported browsers. You will be able to use it offline and it will be placed on your home screen like any other native app. All you have to do is add the [website](https://tobostus.github.io/series-plotter) to your home screen like you would add a bookmark.

## Compatibility disclaimer
This project uses JavaScript Modules. Modules are supported by every modern web browser.
Make sure to access the web app via **http** or **https**.
In case you want to self-host a copy of this program to experiment with, we recommend using [VSCode](https://code.visualstudio.com/) with Ritwick Dey's Extension **Live Server**.

## User interface
*This program is optimized for use with [Firefox](https://www.mozilla.org/en-US/firefox/new/). Other browsers might render elements differently.*

When you first open the page, you are greeted by this user interface (an English version might be added in a later update):

![Screenshot](/images/Screenshot_with_numbers.png)

1. A drop-down list that lets you select the type of series, e.g. "Reelle Funktionenfolgen" (_series of real functions_).

2. A list in which you can put the series you want to visualize. You can find the necessary [syntax](#syntax) [here](#syntax). To add a series, click the button
with the **+** sign. You can remove a series by clicking ![Trash](/images/Delete_button_inline.png). You can also hide or unhide a given series with ![Eye](/images/Hide_button_inline.png).
The circle to the left of a series is a color picker that lets you change the color of the points and lines associated with each series.

3. A drop-down list that lets you select the type of visualization, e.g. "Zeitliche Darstellung" (_temporal visualization_).

4. A panel that contains additional [settings](#settings). Depending on the selections in (1) and (3), there will be different [options](#settings). For more details, see [Settings](#settings).

5. The canvas: All your series will be drawn on it once you click on "Rendern starten!" (_start rendering_). For more details about [navigation](#navigation) on the canvas, see [Navigation](#navigation).

6. The button in the top right corner that allows you to switch the color theme between dark mode and light mode.

7. The button "Exportieren" (_export_) lets you export all your inputs and settings as an XML file. This file will automatically be downloaded to your device when you click the button.

8. The button "Importieren" (_import_) lets you load everything from a file created with "Exportieren" (7) back into the program.

On mobile devices or depending on the width of your browser window, the user interface changes into vertical mode. The layout may change slightly, but all features stay available.

## Navigation
To adjust the coordinate system according to your preferences:
| | Mouse gestures | Touch gestures | Alternatives |
| :---: | :---: | :---: | :---: |
| Moving the visible section | Drag your cursor across the canvas. | Drag your finger across the canvas. | Set lower and upper bounds for $n$ or $x$ using the text fields. |
| Scaling both axes | Put your cursor where you want the center of the scaling to be (inside the canvas). Then scroll with your mouse wheel. | Put two fingers inside the canvas and use pinch-to-zoom diagonally. | - |
| Scaling the $x$-axis | Hold `Shift` + scroll mouse wheel | Pinch-to-zoom horizontally | Set lower and upper bounds for $n$ or $x$ using the text fields. |
| Scaling the $y$-axis | Hold `Ctrl`  + scroll mouse wheel | Pinch-to-zoom vertically | - |
| Resetting the coordinate system | Double-click on the canvas. | Double-tap on the canvas. | - | 

## Settings

| | "Räumliche Darstellung" (_spatial visualization_) | "Zeitliche Darstellung" (_temporal visualization_) |
| :---: | :---: | :---: |
| "**Koordinatensystem**" (_coordinate system_) | Hides or unhides the coordinate system as well as the grid. | Hides or unhides the coordinate system as well as the grid. |
| "**Verbindungslinien**" (_connecting lines_) | Hides or unhides the lines that connect two consecutive members of the series each ($n$ and $n+1$). | Hides or unhides the lines that connect $n$ and $n+1$. For a series of real functions $a_x(n)$ and a fixed $x$, that means: Every line represents the directional vector $(0,\ a_x(n+1) - a_x(n))^T$ with origin $(x,\ a_x(n))^T$. |
| "**Interpolation**" (_interpolation_) | - | Toggles if points inbetween $n$ and $n+1$ should be linearly interpolated. This makes it easier to see where certain points are moving when incrementing $n$. Basically, the point just traces its directional vector $(0,\ a_x(n+1) - a_x(n))^T$. |
| "**Animationsdauer**" (_duration of animation_) | - | Determines how long an increment ($n\mapsto n+1$) takes. The set value for the duration approximates the amount of frames a transition needs. So a lower number means faster animation. |
| "**Dynamische Auflösung**" (_dynamic resolution_) | Toggles whether some values for $n$ should be omitted. If the domain of $n$ is large, one point per $n$ creates lag. | - |
| "**$x$-Auflösung**" (*resolution in* $x$) | - | Determines the resolution of the $x$-axis (how big the spacing between sampling points should be, starting at $x=0$). This applies if you are visualizing series of real functions. |

_Warning: All calculations are performed on your personal device. You should consider the capabilities of your hardware when choosing settings. This especially applies to_ "**Dynamische Auflösung**" _(dynamic resolution) and_ "**$x$-Auflösung**" _(resolution in_ $x$*).*

## Syntax
The required syntax for each function can be found in this table:

| $\LaTeX$ | Syntax | Description |
| :---: | :---: | :---: |
| $$n$$ | n | Index $n\in\mathbb{N_{0}}$ of the series |
| $$x$$ | x | Variable $x\in\mathbb{R}$ of the function |
| $$10$$ | 10 | Integer $a\in\mathbb{Z}$ |
| $$3.14$$ | 3.14 <br /> 3,14 | Decimal number $a\in\mathbb{Q}$ |
| $$a+b\cdot i$$ | a+bi <br /> a+b*i | Complex number $a+b\cdot i\in\mathbb{C}$ |
| $$\pi$$ | pi <br /> Pi <br /> PI | Pi ($\pi$) |
| $$e$$ | e <br /> E | Euler's number $e$ |
| $$f+g$$ | f + g | Addition |
| $$f-g$$ | f - g | Subtraction |
| $$f\cdot g$$ | f * g | Multiplication |
| $$a\cdot x$$ | ax <br /> a*x | Multiplication with a constant $a$ |
| $$\frac{f}{g}$$ | f / g | Division |
| $$(f)$$ | (f) | Brackets |
| $$f^a$$ | f^a | Exponentiation |
| $$\sum_{k=m}^{n}{a}$$ | sum(m; n; a; k) | Sum |
| $$\prod_{k=1}^{n}{a}$$ | prod(1; n; a; k) <br /> product(1; n; a; k) | Product |
| $$\int_{a}^{b}{f \ \mathrm{d}x}$$ | int(a; b; f; x) <br /> integral(a; b; f; x) | Integral |
| $$\|x\|$$ | abs(x) <br /> \|x\| | Absolute value |
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

_Note: If you use_ $x$ _in a series of real numbers, it will be set to_ $0$.

## Contributers
* [Tobostus](https://github.com/Tobostus)
* [Jan Ole Egbers](https://github.com/Jan-Ole-Egbers)

## License
This project is licensed under the GNU GPL-3.0 license - see the [LICENSE](LICENSE) file for details.