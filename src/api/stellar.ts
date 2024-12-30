import axios from 'axios';

export const getProtocolHistory = async (network: 'public' | 'testnet' = 'public') => {
  try {
    const response = await axios.get(`https://api.stellar.expert/explorer/${network}/ledger/protocol-history`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
