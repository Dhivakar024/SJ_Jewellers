// Mock KYC Service (Prepared for FastAPI / MongoDB backend)

export const kycService = {
  getPendingKycRequests: async (kycList) => {
    return (kycList || []).filter((k) => k.status === 'Pending' || k.status === 'Under Review');
  }
};
