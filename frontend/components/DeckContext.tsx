import { createContext, useContext } from 'react';

// Lets a card advance the deck (e.g. the Gentle Reminder's "Done. That's
// it." moving to the next page) without threading a callback through every
// card's props. Provided per page by app/index.tsx; null anywhere a card
// renders outside the deck, so consumers must treat it as optional.
export const DeckAdvanceContext = createContext<(() => void) | null>(null);

export const useDeckAdvance = () => useContext(DeckAdvanceContext);
