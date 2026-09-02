// Titles that arrive from somebody else's feed carry somebody else's
// formatting. YouTube and podcast RSS both use a trailing " - <suffix>"
// for whatever the publisher wanted appended — a speaker ("Your phone's
// camera isn't as good as you think - Rachel Yang"), an episode number
// ("National Vision Board Day - Ep13"), a series name, a date.
//
// On a card that suffix is noise: the channel and the show are already
// credited on their own line underneath, so the dash re-states what the
// card just said and pushes the real title onto an extra line.
//
// Trimmed at render, never in the database — the raw title is still what
// the API returned, so nothing is lost and the rule can change.

// A separator, not a hyphenated word: the dash has to be surrounded by
// space. That is what keeps "TED-Ed", "Slaughterhouse-Five" and
// "e-bike" intact while removing " - Rachel Yang".
const TRAILING_SUFFIX = /\s+[-–—]\s+[^-–—]*$/;

// Podcast show notes arrive as pasted RSS descriptions, and publishers use
// a bare dash on its own line as a section divider. In a feed that has no
// sections it renders as a stray "—" floating between paragraphs, which is
// the same class of borrowed formatting as the title suffix above.
//
// Only lines that are NOTHING but dashes are removed. A dash inside a
// sentence is somebody's punctuation and stays.
const DIVIDER_LINE = /^[\s]*[-–—_*]{1,}[\s]*$/;

export function stripDividerLines(text?: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .filter((line) => !DIVIDER_LINE.test(line))
    .join('\n')
    // Collapse the blank runs the removed dividers leave behind.
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function cleanSourcedTitle(title?: string): string {
  if (!title) return '';
  const trimmed = title.trim();
  const cut = trimmed.replace(TRAILING_SUFFIX, '').trim();
  // Never trim away the whole thing, and never trim so hard that what's
  // left is a fragment — a title that is mostly suffix ("Ep13 - National
  // Vision Board Day") is better shown whole than shown as "Ep13".
  if (cut.length < 12 || cut.length < trimmed.length * 0.4) return trimmed;
  return cut;
}
