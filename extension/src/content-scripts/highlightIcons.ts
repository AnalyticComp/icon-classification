import { findAllIcons, highlight } from "../lib/domUtils";

const icons = findAllIcons();
icons.forEach(highlight);
console.log(`found and highlighted ${icons.length} icons`);
