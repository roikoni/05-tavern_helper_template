export interface CombatBlock {
  turn: string;
  school?: string;
  action: string;
  response?: string;
  roll: string;
  damage?: string;
  status: string;
  result?: string;
  damageValue?: number;
  schoolName?: string;
}

const TAGS = ['turn', 'school', 'action', 'response', 'roll', 'damage', 'status'] as const;

function extractTag(raw: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
  const m = raw.match(re);
  return m ? m[1].trim() : undefined;
}

function extractResult(roll: string): string | undefined {
  const m = roll.match(/→\s*(命中|擦伤|落空|暴击|大失败)/);
  return m ? m[1] : undefined;
}

function extractDamageValue(damage: string): number | undefined {
  const m = damage.match(/=\s*(\d+)\s*点/);
  return m ? Number(m[1]) : undefined;
}

function extractSchoolName(school: string): string | undefined {
  const m = school.match(/^(剑修|法修|体修|丹修|阵修|符修|魂修|魔修|克苏鲁修|散修)/);
  return m ? m[1] : undefined;
}

export function parseCombat(raw: string): CombatBlock | null {
  const turn = extractTag(raw, 'turn');
  const action = extractTag(raw, 'action');
  const roll = extractTag(raw, 'roll');
  const status = extractTag(raw, 'status');
  if (!turn || !action || !roll || !status) return null;

  const school = extractTag(raw, 'school');
  const damage = extractTag(raw, 'damage');

  return {
    turn,
    school,
    action,
    response: extractTag(raw, 'response'),
    roll,
    damage,
    status,
    result: extractResult(roll),
    damageValue: damage ? extractDamageValue(damage) : undefined,
    schoolName: school ? extractSchoolName(school) : undefined,
  };
}
