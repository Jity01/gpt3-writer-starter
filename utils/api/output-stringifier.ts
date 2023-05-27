export const stringifyOutputEmbeddings = (outputEmbeddings: Array<number>) => {
    const outputEmbeddingsString = outputEmbeddings.slice(0,3).map((outputEmbedding) => {
        return outputEmbedding.toString();
    });
    return outputEmbeddingsString.join('&');
};

export const unstringifyOutputEmbeddings = (outputEmbeddingsString: string) => {
    const outputEmbeddings = outputEmbeddingsString.split('&').map((outputEmbeddingString) => {
        return parseFloat(outputEmbeddingString);
    });
    return outputEmbeddings;
};