// KYC Service (Prepared for FastAPI / MongoDB backend)

export const kycService = {
  submitKyc: async ({ userId, pan, aadhar }) => {
    // Simulated async backend call
    await new Promise((resolve) => setTimeout(resolve, 80));
    return {
      success: true,
      kycStatus: 'Verified',
      pan,
      aadhar
    };
  },

  getPendingKycRequests: async (kycList) => {
    return (kycList || []).filter((k) => k.status === 'Pending' || k.status === 'Under Review');
  }
};
