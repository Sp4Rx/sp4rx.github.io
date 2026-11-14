import { stack, type Layer } from "../data/resume";

// "Matches" means the project or role covered every layer the visitor ticked.
export const matches = (item: { layers: Layer[] }, picked: Layer[]) =>
  picked.length > 0 && picked.every((layer) => item.layers.includes(layer));

// Always in stack order, whatever order the visitor ticked them in.
export const needsText = (picked: Layer[]) =>
  stack.filter((s) => picked.includes(s.id)).map((s) => s.need).join(" + ");

export const mailto = (email: string, picked: Layer[]) => {
  const needs = needsText(picked);
  const subject = needs ? `Project: ${needs}` : "Project enquiry";
  const body = `Hi Suvajit,\n\n${needs ? `I need: ${needs}.\n\n` : ""}A bit about the project:\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
