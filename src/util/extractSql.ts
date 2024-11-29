export const extractSQL = (response: string) => {
  // Match all SQL blocks within ```sql ... ``` or just ```
  const sqlBlocks = response.match(/```(?:sql)?\s*([\s\S]*?)```/gi);

  if (sqlBlocks) {
    // Join all matched SQL blocks into one string, ensuring proper spacing
    return sqlBlocks.map((block) =>
      block
        .replace(/```(?:sql)?\s*/i, "")
        .replace(/```$/, "")
        .trim()
    );
  }

  // If no SQL blocks are found, return the original response (or handle as needed)
  return response.trim();
};
