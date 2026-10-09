import { minGhAttachVersion } from "./minGhAttachVersion";

export const screenshotGuidance = `Screenshots: pass --screenshot '[Group/]Caption=path' once per image or video
(png, jpg, jpeg, gif, webp, svg, mp4, webm, mov). gh ${minGhAttachVersion}+ uploads each
file and the body gets a ## Screenshots section: one ### Group heading per group
with its images in a 2-column captioned table (so light/dark pairs sit side by
side), then any ungrouped images. The spec splits on the first '=' (label vs
path), then the label on the first '/' (group vs caption); a missing caption
falls back to the file name. A missing file or unsupported extension fails the
command before anything is previewed or sent. Never author ## Screenshots in a
section option yourself.

  --screenshot 'Profile/Career Connect light=shots/profile-light.png'
  --screenshot 'Profile/Career Connect dark=shots/profile-dark.png'`;
