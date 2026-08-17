// Mock Withdrawal Service (Prepared for FastAPI / MongoDB backend)

export const withdrawalService = {
  getWithdrawals: async (list) => {
    return list || [];
  }
};
