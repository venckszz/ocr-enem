import type { EmbeddingProvider } from '../../application/ports/embedding-provider.js';
import type { RubricContextProvider } from '../../application/ports/rubric-context-provider.js';

const RUBRIC_ANCHORS = [
  'Competência I: domínio da modalidade escrita formal. Verifique estrutura sintática, ortografia, pontuação, concordância, regência, crase e vocabulário formal.',
  'Competência I: nota 200 exige estrutura sintática excelente e no máximo dois desvios leves; 160 admite boa estrutura e poucos desvios relevantes.',
  'Competência II: compreensão integral do tema, texto dissertativo-argumentativo e repertório sociocultural legitimado, pertinente e produtivo.',
  'Competência II: repertório produtivo deve sustentar a tese por análise, não funcionar como citação decorativa ou desconectada.',
  'Competência III: projeto de texto com tese clara, antecipação dos argumentos, tópicos frasais delimitados, progressão e autoria crítica.',
  'Competência III: argumentos devem desenvolver os problemas apresentados; a proposta de intervenção deve responder ao diagnóstico do desenvolvimento.',
  'Competência IV: coesão entre frases e parágrafos, conectivos semanticamente adequados, retomadas referenciais claras e variedade vocabular.',
  'Competência IV: penalize conectivo inadequado, repetição monótona, parágrafo sem operador, anáfora ambígua e repetição lexical abusiva.',
  'Competência V: proposta de intervenção respeitando direitos humanos, contendo agente, ação, modo ou meio, finalidade e detalhamento.',
  'Competência V: cada elemento válido e completo vale um nível de 40 pontos; desrespeito aos direitos humanos pode levar a zero.',
  'Escala oficial por competência: somente 0, 40, 80, 120, 160 ou 200. A nota deve representar o nível global do texto.',
  'Confiabilidade: falhas observadas e exemplos justificam a nota, mas pontos perdidos por item não devem ser somados mecanicamente.',
] as const;

export class SemanticRubricContextProvider implements RubricContextProvider {
  private anchorEmbeddings?: Promise<number[][]>;

  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly resultLimit = 4,
  ) {}

  async findRelevant(text: string, theme?: string): Promise<string[]> {
    try {
      this.anchorEmbeddings ??= this.embeddings.embed([...RUBRIC_ANCHORS], 'RETRIEVAL_DOCUMENT');
      const [anchors, [query]] = await Promise.all([
        this.anchorEmbeddings,
        this.embeddings.embed([`Tema: ${theme ?? 'não informado'}\nRedação: ${text.slice(0, 6000)}`], 'RETRIEVAL_QUERY'),
      ]);
      if (!query) return [];
      return anchors
        .map((vector, index) => ({ index, score: this.cosineSimilarity(query, vector) }))
        .sort((left, right) => right.score - left.score)
        .slice(0, this.resultLimit)
        .map(({ index }) => RUBRIC_ANCHORS[index]);
    } catch {
      return [];
    }
  }

  private cosineSimilarity(left: number[], right: number[]) {
    const size = Math.min(left.length, right.length);
    let dot = 0;
    let leftMagnitude = 0;
    let rightMagnitude = 0;
    for (let index = 0; index < size; index += 1) {
      dot += left[index] * right[index];
      leftMagnitude += left[index] ** 2;
      rightMagnitude += right[index] ** 2;
    }
    const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
    return denominator === 0 ? 0 : dot / denominator;
  }
}
