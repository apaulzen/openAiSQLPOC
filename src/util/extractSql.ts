export const extractSQL = (response: string): string => {
  // Match SQL block within ```sql ... ``` or ``` ... ```
  const sqlBlock = response.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (sqlBlock && sqlBlock[1]) {
    return sqlBlock[1].trim();
  }

  // If no block is found, assume the response itself is the query
  return response.trim();
};
