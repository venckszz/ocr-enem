export interface RubricContextProvider {
  findRelevant(text: string, theme?: string): Promise<string[]>;
}
