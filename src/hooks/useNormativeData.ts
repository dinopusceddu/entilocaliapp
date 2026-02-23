import { useQuery } from '@tanstack/react-query';
import { NormativeData } from '../types.ts';
import { NormativeDataSchema } from '../schemas/fundDataSchemas.ts';

const fetchNormativeData = async (): Promise<NormativeData> => {
  console.log('Fetching normative data...');
  try {
    const response = await fetch('/normativa.json');
    if (!response.ok) {
      throw new Error(`Errore HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Normative data fetched, parsing...');
    return NormativeDataSchema.parse(data);
  } catch (e) {
    console.error('Error fetching normative data:', e);
    throw e;
  }
};

export const useNormativeData = () => {
  // Temporary switch to useQuery to debug suspense issue
  const query = useQuery<NormativeData, Error>({
    queryKey: ['normativeData'],
    queryFn: fetchNormativeData,
    staleTime: Infinity,
    retry: 1,
  });

  return query;
};
