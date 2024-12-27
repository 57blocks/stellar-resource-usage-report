import { printTable } from '@/share';
import { anyObj, CalcResourceProps } from '@/types/interface';
import { STELLAR_LIMITS_CONFIG } from '@/constants';
import { getStats } from '@/tasks';

const calcResource = async (props: CalcResourceProps) => {
  const stats = (await getStats(props)) as anyObj;
  const res: (string | number)[][] = [];

  Object.entries(stats).forEach(([key, value]) => {
    const limit = STELLAR_LIMITS_CONFIG[key as 'cpu_insns'];
    const percent = parseFloat(((value / limit.value) * 100).toFixed(2));
    res.push([key, value, limit.label, percent]);
  });

  printTable(res);

  // For testing purposes
  return true;
};

export default calcResource;
