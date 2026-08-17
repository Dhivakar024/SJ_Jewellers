// Mock Transaction Service (Prepared for FastAPI / MongoDB backend)

export const transactionService = {
  getTransactions: async (list) => {
    return list || [];
  }
};
