// Prompts for the Notebook card (Wave 2, item 1). One rides mid-slate per
// session. Voice rules: specific over generic, slightly provocative, never
// "how was your day", no exclamation marks. A prompt should be answerable
// in two honest lines and feel faintly like being caught.

export interface WritingPrompt {
  id: string;
  prompt: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  { id: 'yes-regret', prompt: 'What did you say yes to recently that you wish you hadn’t?' },
  { id: 'owns-you-back', prompt: 'Name something you own that owns you back.' },
  { id: 'unasked-question', prompt: 'What question have you been avoiding asking someone?' },
  { id: 'boredom-became', prompt: 'Describe the last time you were bored. What did it turn into?' },
  { id: 'nobody-noticed', prompt: 'What would you stop doing tomorrow if nobody would notice?' },
  { id: 'smallest-improvement', prompt: 'Write down the smallest thing that improved today.' },
  { id: 'belief-died', prompt: 'What did you believe five years ago that quietly died?' },
  { id: 'unsent-message', prompt: 'Who do you owe a message? One line on why it’s still unsent.' },
  { id: 'almost-said', prompt: 'What did you almost say out loud today?' },
  { id: 'brain-dump', prompt: 'Empty your head into three lines. The book will hold them.' },
  { id: 'useless-heart', prompt: 'What is the most useless thing you know by heart?' },
  { id: 'third-person', prompt: 'Describe your day in the third person. One sentence.' },
  { id: 'pretending', prompt: 'What are you pretending not to know?' },
  { id: 'ten-year-old', prompt: 'Which of your habits would your ten-year-old self find ridiculous?' },
  { id: 'never-visit', prompt: 'What place do you think about but never visit?' },
  { id: 'own-advice', prompt: 'Write down the advice you keep giving other people.' },
  { id: 'repeated-thought', prompt: 'What was today’s most repeated thought?' },
  { id: 'screen-suggested', prompt: 'Name one thing you did today only because a screen suggested it.' },
  { id: 'unclaimed-hour', prompt: 'What would you do with an hour nobody could claim?' },
  { id: 'lost-track', prompt: 'When did you last lose track of time somewhere other than a screen?' },
  { id: 'worry-age', prompt: 'Write down a worry. Then write down how old it is.' },
  { id: 'only-you-noticed', prompt: 'What did you notice today that nobody else seemed to?' },
  { id: 'running-conversation', prompt: 'Which conversation from this week is still running in your head?' },
  { id: 'small-fix', prompt: 'What is something small you fixed recently?' },
];
