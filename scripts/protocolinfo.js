// This program visualizes mathematical series in a browser.
// Copyright (C) 2024  Tobias Straube

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Prints an error message iff the site/program is not visited via HTTP or HTTPS as JavaScript
 * modules only work in modern browsers via said protocols.
 */
function printErrorMessage() {
    const proto = location.protocol;
    if(proto !== "http:" && proto !== "https:") {
        console.log("Your current setup does not support JavaScript modules.\n"
            + "You will need to use a modern web browser and visit this site via HTTP or HTTPS in order to use this program.");
    }
}

printErrorMessage();