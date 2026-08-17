// Mock Asset Rates Service (Prepared for FastAPI / MongoDB backend)

export const ratesService = {
  saveRates: async ({ goldRate, silverRate }) => {
    localStorage.setItem('sj_goldRate', goldRate.toString());
    localStorage.setItem('sj_silverRate', silverRate.toString());
    return { success: true, goldRate, silverRate };
  }
};
