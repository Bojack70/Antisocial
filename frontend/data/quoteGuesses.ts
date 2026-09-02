// One Good Line — a single line stripped of its home; the guess is which
// book, show, song, poem or game it walked out of. Decoys deliberately
// cross media: not knowing the MEDIUM is half the game.
//
// Every attribution here was verified against live sources on 2026-09-01
// (exact wording, true source, and the reveal's context). Do not add an
// entry from memory: quotes are the most misattributed content class on
// the internet, and more than one entry below exists BECAUSE the popular
// attribution turned out to be wrong. Decoys are real, well-known works.

export interface QuoteGuess {
  id: string;
  quote: string;
  /** The correct source, as displayed. */
  answer: string;
  decoys: string[];
  /** The payoff: who says it, when, or the story behind the line. */
  reveal: string;
}

export const QUOTE_GUESSES: QuoteGuess[] = [
  {
    id: 'so-it-goes',
    quote: 'So it goes.',
    answer: 'Slaughterhouse-Five, Kurt Vonnegut, novel',
    decoys: [
      'Catch-22, Joseph Heller, novel',
      'The Stranger, Albert Camus, novel',
      'True Detective, TV series',
    ],
    reveal:
      'Vonnegut’s shrug at death. The novel says it 106 times, once for nearly every death it mentions, from a bottle of champagne going flat to the firebombing of Dresden.',
  },
  {
    id: 'pleasure-to-burn',
    quote: 'It was a pleasure to burn.',
    answer: 'Fahrenheit 451, Ray Bradbury, novel',
    decoys: [
      'American Psycho, Bret Easton Ellis, novel',
      'Breaking Bad, TV series',
      '“Burning Down the House”, Talking Heads, song',
    ],
    reveal:
      'The opening line of the novel. Bradbury lets “burn” sit without an object for a whole paragraph, so you enjoy the fire before finding out it’s books.',
  },
  {
    id: 'i-am-i-am',
    quote: 'I took a deep breath and listened to the old brag of my heart: I am, I am, I am.',
    answer: 'The Bell Jar, Sylvia Plath, novel',
    decoys: [
      'Fleabag, TV series',
      'Anna Karenina, Leo Tolstoy, novel',
      'Eternal Sunshine of the Spotless Mind, film',
    ],
    reveal:
      'Esther Greenwood, waiting outside her exit interview from the psychiatric hospital, fresh from a funeral, her own heartbeat offered as proof. Readers have argued for decades over whether Plath wrote “brag” or “bray.”',
  },
  {
    id: 'memories-warm',
    quote: 'Memories warm you up from the inside. But they also tear you apart.',
    answer: 'Kafka on the Shore, Haruki Murakami, novel',
    decoys: [
      'The Remains of the Day, Kazuo Ishiguro, novel',
      'Inside Out, film',
      '“Holocene”, Bon Iver, song',
    ],
    reveal:
      'Murakami, 2002. The line circulates online stripped of everything around it, which is roughly what the novel says memories do to people.',
  },
  {
    id: 'time-distance',
    quote: 'Time is the longest distance between two places.',
    answer: 'The Glass Menagerie, Tennessee Williams, play',
    decoys: [
      'Interstellar, film',
      'One Hundred Years of Solitude, Gabriel García Márquez, novel',
      'Doctor Who, TV series',
    ],
    reveal:
      'Tom Wingfield’s closing line, looking back at the family he walked out on: “I didn’t go to the moon, I went much further.” The leaving worked. The forgetting didn’t.',
  },
  {
    id: 'gets-easier',
    quote: 'It gets easier. Every day it gets a little easier. But you gotta do it every day, that’s the hard part.',
    answer: 'BoJack Horseman, TV series',
    decoys: [
      'Rocky, film',
      'Atomic Habits, James Clear, book',
      'The Alchemist, Paulo Coelho, novel',
    ],
    reveal:
      'Said to BoJack, collapsed mid-jog, by a background character the credits list only as “Jogging Baboon.” The show gave its most-quoted line about recovery to a sight gag.',
  },
  {
    id: 'good-old-days',
    quote: 'I wish there was a way to know you’re in the good old days before you’ve actually left them.',
    answer: 'The Office (US), TV series',
    decoys: [
      'Boyhood, film',
      '“Closing Time”, Semisonic, song',
      'The Kite Runner, Khaled Hosseini, novel',
    ],
    reveal:
      'Andy Bernard, in the series finale, the show’s most insecure character, quietly summarizing nine seasons on his way out the door.',
  },
  {
    id: 'all-stories',
    quote: 'We’re all stories in the end. Just make it a good one, eh?',
    answer: 'Doctor Who, TV series',
    decoys: [
      'The Princess Bride, film',
      'Big Fish, film',
      'The Name of the Wind, Patrick Rothfuss, novel',
    ],
    reveal:
      'The Eleventh Doctor, whispering goodbye to a sleeping child while expecting to be erased from time, a bedtime story, told by the story.',
  },
  {
    id: 'flat-circle',
    quote: 'Time is a flat circle.',
    answer: 'True Detective, TV series',
    decoys: [
      'Thus Spoke Zarathustra, Friedrich Nietzsche, book',
      'Dark, TV series',
      'Arrival, film',
    ],
    reveal:
      'Remembered as Rust Cohle’s philosophy. In the show, a meth cook says it to him first (Rust’s reply is “What is that, Nietzsche?”) and he only adopts it later. The line got misattributed inside its own series.',
  },
  {
    id: 'tears-in-rain',
    quote: 'All those moments will be lost in time, like tears in rain.',
    answer: 'Blade Runner, film',
    decoys: [
      'Neuromancer, William Gibson, novel',
      'Westworld, TV series',
      '2001: A Space Odyssey, film',
    ],
    reveal:
      'Rutger Hauer cut the scripted monologue down and added this line himself the night before filming, without telling Ridley Scott. The most famous words in the film came from the actor playing the android.',
  },
  {
    id: 'crack-in-everything',
    quote: 'There is a crack in everything. That’s how the light gets in.',
    answer: '“Anthem”, Leonard Cohen, song',
    decoys: [
      'Rumi, 13th-century poetry',
      'The Prophet, Kahlil Gibran, book',
      'Desiderata, Max Ehrmann, poem',
    ],
    reveal:
      'The refrain of “Anthem,” which Cohen worked at for roughly a decade before it landed on The Future in 1992. A line that took ten years now travels the internet in about a second, usually without his name on it.',
  },
  {
    id: 'love-you-take',
    quote: 'And in the end, the love you take is equal to the love you make.',
    answer: '“The End”, The Beatles, song',
    decoys: [
      '“All You Need Is Love”, The Beatles, song',
      'Moulin Rouge!, film',
      'Romeo and Juliet, William Shakespeare, play',
    ],
    reveal:
      'Effectively the last line of Abbey Road, the final album the four recorded together. The song also carries Ringo’s only drum solo on a Beatles record.',
  },
  {
    id: 'how-did-i-get-here',
    quote: 'And you may ask yourself, “Well, how did I get here?”',
    answer: '“Once in a Lifetime”, Talking Heads, song',
    decoys: ['Fight Club, film', 'The Truman Show, film', 'American Beauty, film'],
    reveal:
      'David Byrne’s half-spoken sermon about living on autopilot: waking up mid-life to audit the house, the car, the beautiful wife, with no memory of choosing any of it.',
  },
  {
    id: 'subway-walls',
    quote: 'The words of the prophets are written on the subway walls.',
    answer: '“The Sound of Silence”, Simon & Garfunkel, song',
    decoys: [
      '“Howl”, Allen Ginsberg, poem',
      '1984, George Orwell, novel',
      'V for Vendetta, film',
    ],
    reveal:
      'Paul Simon wrote it at 21: mostly at night, in his parents’ bathroom, with the lights off, because he liked the acoustics.',
  },
  {
    id: 'disturb-universe',
    quote: 'Do I dare disturb the universe?',
    answer: '“The Love Song of J. Alfred Prufrock”, T.S. Eliot, poem',
    decoys: [
      'Dead Poets Society, film',
      'The Chocolate War, Robert Cormier, novel',
      'Interstellar, film',
    ],
    reveal:
      'Prufrock, paralyzed over whether to act at all in his own life. Eliot drafted it around 1910; nobody would publish it until 1915.',
  },
  {
    id: 'hell-other-people',
    quote: 'Hell is other people.',
    answer: 'No Exit, Jean-Paul Sartre, play',
    decoys: [
      'The Good Place, TV series',
      'Seinfeld, TV series',
      'Crime and Punishment, Fyodor Dostoevsky, novel',
    ],
    reveal:
      'Spoken by a damned soul locked in one room with two others, forever. Sartre spent years insisting it’s misread: he meant that when your relations with someone turn twisted, that person becomes your hell, not that company is hell.',
  },
  {
    id: 'war-never-changes',
    quote: 'War. War never changes.',
    answer: 'Fallout, video game',
    decoys: [
      'All Quiet on the Western Front, Erich Maria Remarque, novel',
      'Apocalypse Now, film',
      'The Art of War, Sun Tzu, book',
    ],
    reveal:
      'The opening narration of the 1997 original, read by Ron Perlman, reportedly for forty dollars and a sandwich. Every Fallout since has opened with the same four words.',
  },
  {
    id: 'curves-of-lips',
    quote: 'The curves of your lips rewrite history.',
    answer: 'The Picture of Dorian Gray, Oscar Wilde, novel',
    decoys: [
      'Call Me by Your Name, film',
      'Wuthering Heights, Emily Brontë, novel',
      'Antony and Cleopatra, William Shakespeare, play',
    ],
    reveal:
      'Nobody in the novel says it aloud. It’s the closing line of an anonymous love letter Dorian keeps, and repeats to himself near the end. Wilde never reveals who wrote it.',
  },
];
