export function jsonLoader(source) {
  this.addDeps();
  return `export default ${JSON.stringify(source)}`;
}