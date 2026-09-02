import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// The HTML shell every web route is rendered into. This is where the app
// stops being a web page and starts behaving like an installed app:
// the manifest, the home-screen icon, and the meta that tell iOS to drop
// the Safari chrome when it is launched from the home screen.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover lets the feed run under the notch and the
            home indicator, the way a native screen does. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        <title>Modern Weirdness</title>
        <meta name="description" content="A museum of curiosity in your pocket" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F1EADC" />

        {/* iOS ignores the manifest for these three, so they are repeated
            here — without them, Add to Home Screen opens a Safari tab
            with a URL bar instead of a standalone app. */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Modern Weirdness" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Disables body scrolling on web so ScrollView components work. */}
        <ScrollViewStyleReset />

        {/* Painted before React mounts, so the launch is a calm off-white
            rather than a white flash. */}
        <style dangerouslySetInnerHTML={{ __html: backgroundStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const backgroundStyle = `
body {
  background-color: #F1EADC;
  overscroll-behavior-y: none;
}

/* The Audio Drift player. It is the browser's native <audio controls>,
   and its panel is a shadow-DOM part — setting backgroundColor on the
   element itself paints BEHIND that panel, which is why the control kept
   reading as a white pill on the parchment. These are the only hooks
   Chrome and Safari expose, so this is the one place the player can be
   brought into the palette. Firefox ignores them and keeps its own
   control, which is a plain fallback rather than a broken one. */
audio::-webkit-media-controls-enclosure {
  background-color: #E8DFCB;
  border-radius: 10px;
}
audio::-webkit-media-controls-panel {
  background-color: #E8DFCB;
}
audio::-webkit-media-controls-current-time-display,
audio::-webkit-media-controls-time-remaining-display {
  color: #6B6A68;
  text-shadow: none;
}
`;
