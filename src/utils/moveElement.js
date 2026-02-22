export default function moveElement(elements, selectedId, direction) {
  const index = elements.findIndex(el => el.id === selectedId);
  if (index === -1) return elements;

  const newElements = [...elements];
  const element = newElements.splice(index, 1)[0];

  if (direction === "toFront") newElements.push(element);
  else if (direction === "toBack") newElements.unshift(element);
  else if (direction === "forward" && index < elements.length - 1)
    newElements.splice(index + 1, 0, element);
  else if (direction === "backward" && index > 0)
    newElements.splice(index - 1, 0, element);

  return newElements;
}
