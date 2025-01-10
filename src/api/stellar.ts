export const getProtocolHistory = async (network: 'public' | 'testnet' = 'public') => {
  try {
    const response = await fetch(`https://api.stellar.expert/explorer/${network}/ledger/protocol-history`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
