#### _[English version here.](README-EN.md)_

# series-plotter
Mit diesem Tool kann man sich beliebige reelle Zahlenfolgen oder reelle Funktionenfolgen veranschaulichen lassen.

## Zugang
Die aktuelle Version des Tools ist unter https://tobostus.github.io/series-plotter verfügbar.

### Installation der PWA
Es ist außerdem möglich, das Tool mit kompatiblen Browsern als [Progressive Web App](https://de.wikipedia.org/wiki/Progressive_Web_App) (PWA) zu installieren. Die App erscheint dann wie andere native Apps auf eurem Home-Bildschirm und kann auch offline genutzt werden. Ihr müsst dafür lediglich die [Seite](https://tobostus.github.io/series-plotter) wie ein Lesezeichen zu eurem Home-Bildschirm hinzufügen.

## Kompatibilitätshinweis
Das Projekt verwendet JavaScript-Module. Module werden von jedem modernen Browser unterstützt.
Stellt sicher, dass ihr die Seite über **http** oder **https** aufruft.
Falls ihr für Testzwecke selbst eine lokale Kopie hosten wollt, empfehlen wir [VSCode](https://code.visualstudio.com/) mit der Extension **Live Server** von Ritwick Dey.

## Benutzeroberfläche
*Das Programm ist für die Nutzung mit [Firefox](https://www.mozilla.org/de/firefox/new/) optimiert. In anderen Browsern können Elemente anders aussehen.*

Wenn ihr die Seite aufruft, werdet ihr von folgender Nutzeroberfläche begrüßt:

![Screenshot](/images/Screenshot_with_numbers.png)

1. Eine Dropdown-Liste, um die Art der Folge auszuwählen, z.B. "Reelle Funktionenfolgen".

2. Eine Liste, in die ihr eure Folgen eintragen könnt. Die [Syntax](#syntax) dafür findet ihr [hier](#syntax). Ihr könnt eine neue Folge durch den Button mit
dem **+** hinzufügen. Bereits vorhandene Folgen können mit ![Mülltonne](/images/Delete_button_inline.png) gelöscht und mit ![Auge](/images/Hide_button_inline.png)
aus- oder eingeblendet werden. Die Kreisscheibe links von einer Folge ist ein Farbwähler, mit dem ihr die Farbe der Punkte und Linien einer Folge anpassen könnt.

3. Eine Dropdown-Liste, um die Art der Visualisierung auszuwählen, z.B. "Zeitliche Darstellung".

4. Ein Feld, in dem ihr zusätzliche [Optionen](#einstellungen) finden könnt. Je nach Wahl in (1) und (3) gibt es hier unterschiedliche Möglichkeiten. Mehr dazu findet ihr unter [Einstellungen](#einstellungen).

5. Das Hauptfenster: Hier werden euch die Folgen angezeigt, sobald ihr auf "Rendern starten!" drückt. Zur [Navigation](#navigation) findet ihr [hier](#navigation) die Informationen.

6. Mit dem Button in der oberen rechten Ecke könnt ihr zwischen Light Mode und Dark Mode wechseln.

7. Mit dem Button "Exportieren" könnt ihr all eure Eingaben und Einstellungen in einer XML-Datei exportieren. Diese wird beim Klick auf den Button automatisch heruntergeladen.

8. Mit dem Button "Importieren" könnt ihr eine mithilfe von "Exportieren" (7) erstellte XML-Datei wieder in das Programm laden.

Auf Mobilgeräten oder abhängig von der Breite des Browserfensters wechselt die Oberfläche in den vertikalen Modus. Die Anordnung der Elemente ist dann etwas anders, aber die Funktionen bleiben gleich.

## Navigation
Um euer Koordinatensystem nach euren Wünschen auszurichten, gibt es folgende Möglichkeiten:
| | Mausgesten | Touch-Gesten | Weitere Optionen |
| :---: | :---: | :---: | :---: |
| Ausschnitt verschieben | Setze den Zeiger in das Hauptfenster, halte die linke Maustaste gedrückt und ziehe den Zeiger in die gewünschte Richtung. | Setze einen Finger an eine Stelle im Hauptfenster und ziehe in die gewünschte Richtung. | Stelle untere und obere Intervallgrenzen für $n$ oder $x$ über die Textfelder ein. |
| Beide Achsen gleichzeitig skalieren | Gehe mit dem Zeiger zum gewünschten Zentrum der Skalierung (im Hauptfenster). Scrolle einfach mit dem Mausrad. | Setze zwei Finger in das Hauptfenster und ziehe sie diagonal auseinander bzw. führe sie zusammen. | - |
| $x$-Achse skalieren | `Shift` halten + Mausrad scrollen | Horizontal mit zwei Fingern zoomen | Stelle untere und obere Intervallgrenzen für $n$ oder $x$ über die Textfelder ein. |
| $y$-Achse skalieren | `Strg` halten + Mausrad scrollen | Vertikal mit zwei Fingern zoomen | - |
| Ausschnitt zurücksetzen | Doppelklick in das Hauptfenster. | Doppelt in das Hauptfenster tippen. | - |

## Einstellungen

| | Räumliche Darstellung | Zeitliche Darstellung |
| :---: | :---: | :---: |
| **Koordinatensystem** | Blendet das Koordinatensystem sowie das Netz ein oder aus. | Blendet das Koordinatensystem sowie das Netz ein oder aus. |
| **Verbindungslinien** | Blendet die Linien, die je zwei benachbarte Folgenmitglieder ($n$ und $n+1$) verbinden, ein oder aus. | Blendet die Linien, die $n$ und $n+1$ miteinander verbinden, ein oder aus. Für eine reelle Funktionenfolge $a_x(n)$ entspricht das für festes $x$ je dem an den Punkt $(x,\ a_x(n))^T$ angesetzten Richtungsvektor $(0,\ a_x(n+1) - a_x(n))^T$. |
| **Interpolation** | - | Stellt die Interpolation von Punkten zwischen zwei Schritten $n$ und $n+1$ an oder aus. So sieht man besser, wo einzelne Punkte hinwandern. Das entspricht dem Folgen des Richtungsvektors $(0,\ a_x(n+1) - a_x(n))^T$. |
| **Animationsdauer** | - | Stellt die Dauer ein, die ein Wechsel von $n$ auf $n+1$ benötigt. Sie entspricht in etwa der Anzahl an Frames, d.h. eine kleinere Zahl bedeutet eine schnellere Animation. |
| **Dynamische Auflösung** | Stellt an oder aus, ob bei einem großen Definitionsbereich von $n$ Werte ausgelassen werden sollen. Für einen sehr großen Definitionsbereich von $n$ erzeugt ein Punkt pro $n$ viel Lag. | - |
| **$x$-Auflösung** | - | Stellt die Auflösung der $x$-Achse ein (in welchem Abstand Punkte berechnet werden sollen, ausgehend vom Ursprung). Diese Einstellung betrifft reelle Funktionenfolgen. |

_Achtung: Alle Berechnungen finden auf deinem Endgerät statt. Orientiere dich für die Einstellungen also an den Kapazitäten deiner Hardware. Das betrifft insbesondere_ **Dynamische Auflösung** _und_ $x$**-Auflösung**.

## Syntax
Die zu verwendene Syntax könnt ihr folgender Tabelle entnehmen:

| $\LaTeX$ | Syntax | Beschreibung |
| :---: | :---: | :---: |
| $$n$$ | n | Folgenindex $n\in\mathbb{N_{0}}$ |
| $$x$$ | x | Funktionsargument $x\in\mathbb{R}$ |
| $$10$$ | 10 | Ganzzahl $a\in\mathbb{Z}$ |
| $$3.14$$ | 3.14 <br /> 3,14 | Dezimalzahl $a\in\mathbb{Q}$ |
| $$a+b\cdot i$$ | a+bi <br /> a+b*i | Komplexe Zahl $a+b\cdot i\in\mathbb{C}$ |
| $$\pi$$ | pi <br /> Pi <br /> PI | Kreiszahl Pi ($\pi$) |
| $$e$$ | e <br /> E | Eulersche Zahl $e$ |
| $$f+g$$ | f + g | Addition |
| $$f-g$$ | f - g | Subtraktion |
| $$f\cdot g$$ | f * g | Multiplikation |
| $$a\cdot x$$ | ax <br /> a*x | Multiplikation mit Konstante $a$ |
| $$\frac{f}{g}$$ | f / g | Division |
| $$(f)$$ | (f) | Klammerung |
| $$f^a$$ | f^a | Potenz |
| $$\sum_{k=m}^{n}{a}$$ | sum(m; n; a; k) | Summe |
| $$\prod_{k=1}^{n}{a}$$ | prod(1; n; a; k) <br /> product(1; n; a; k) | Produkt |
| $$\int_{a}^{b}{f \ \mathrm{d}x}$$ | int(a; b; f; x) <br /> integral(a; b; f; x) | Integral |
| $$\|x\|$$ | abs(x) <br /> \|x\| | Betrag |
| $$\mathrm{sgn}(x)$$ | sign(x) | Vorzeichen |
| $$\lfloor x\rfloor$$ | floor(x) | Abrunden |
| $$\lceil x\rceil$$ | ceil(x) | Aufrunden |
| $$\exp(x)$$ | exp(x) | Exponentialfunktion |
| $$\ln(x)$$ | ln(x) | Natürlicher Logarithmus |
| $$\log_{10}(x)$$ | lg(x) | Dekadischer Logarithmus |
| $$\log_{b}(x)$$ | log(x; b) | Logarithmus zur Basis $b$ |
| $$\sqrt{x}$$ | sqrt(x) | Quadratwurzel |
| $$\sin(x)$$ | sin(x) | Sinus |
| $$\cos(x)$$ | cos(x) | Cosinus |
| $$\tan(x)$$ | tan(x) | Tangens |
| $$\cot(x)$$ | cot(x) | Kotangens |
| $$\arcsin(x)$$ | arcsin(x) | Arkussinus |
| $$\arccos(x)$$ | arccos(x) | Arkuscosinus |
| $$\arctan(x)$$ | arctan(x) | Arkustangens |
| $$\mathrm{acot}(x)$$ | acot(x) | Arkuskotangens |
| $$\sinh(x)$$ | sinh(x) | Sinus hyperbolicus |
| $$\cosh(x)$$ | cosh(x) | Cosinus hyperbolicus |
| $$\tanh(x)$$ | tanh(x) | Tangens hyperbolicus |
| $$\coth(x)$$ | coth(x) | Cotangens hyperbolicus |
| $$\Re(x)$$ | re(x) | Realteil |
| $$\Im(x)$$ | im(x) | Imaginärteil |
| $$\bar{x}$$ | conj(x) | Komplex Konjugiertes |

_Anmerkung: Wenn man_ $x$ _in einer reellen Zahlenfolge verwendet, ist dessen Wert konstant auf_ $0$ _gesetzt._

## Beitragende
* [Tobostus](https://github.com/Tobostus)
* [Jan Ole Egbers](https://github.com/Jan-Ole-Egbers)

## Lizenz
Dieses Projekt ist unter der GNU GPL-3.0 license lizensiert - siehe [LICENSE](LICENSE) für mehr Informationen.