import { describe, it, expect } from 'vitest';
import modelsData from '../data/models.json';
import costData from '../data/costCalculator.json';

describe('Cost Calculator Data', () => {
  it('should have usage presets defined', () => {
    expect(costData.usagePresets).toBeDefined();
    expect(costData.usagePresets.length).toBeGreaterThan(0);
  });

  it('should have all required preset fields', () => {
    costData.usagePresets.forEach(preset => {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.description).toBeDefined();
      expect(preset.tokensPerDay).toBeDefined();
      expect(preset.requestsPerDay).toBeDefined();
    });
  });

  it('should have self-hosting hardware data', () => {
    expect(costData.selfHostingCosts).toBeDefined();
    expect(costData.selfHostingCosts.hardware).toBeDefined();
    expect(costData.selfHostingCosts.hardware.length).toBeGreaterThan(0);
  });

  it('should have tips for users', () => {
    expect(costData.tips).toBeDefined();
    expect(costData.tips.length).toBeGreaterThan(0);
  });
});

describe('Cost Calculations', () => {
  const calculateMonthlyCost = (tokensPerDay: number, costPer1M: number) => {
    const tokensPerMonth = tokensPerDay * 30;
    const tokensInMillions = tokensPerMonth / 1_000_000;
    return costPer1M * tokensInMillions;
  };

  it('should calculate monthly cost correctly for GPT-4', () => {
    const gpt4 = modelsData.models.find(m => m.name === 'GPT-4');
    expect(gpt4).toBeDefined();

    if (gpt4) {
      const tokensPerDay = 100000; // 100K tokens/day
      const monthlyCost = calculateMonthlyCost(tokensPerDay, gpt4.costPer1M);

      // 100K tokens/day * 30 days = 3M tokens
      // 3M tokens * $30/1M = $90
      expect(monthlyCost).toBe(90);
    }
  });

  it('should return zero cost for free models', () => {
    const freeModels = modelsData.models.filter(m => m.costPer1M === 0);
    expect(freeModels.length).toBeGreaterThan(0);

    freeModels.forEach(model => {
      const monthlyCost = calculateMonthlyCost(1000000, model.costPer1M);
      expect(monthlyCost).toBe(0);
    });
  });

  it('should calculate yearly cost as 12x monthly', () => {
    const claude = modelsData.models.find(m => m.name === 'Claude 3.5 Sonnet');
    expect(claude).toBeDefined();

    if (claude) {
      const tokensPerDay = 500000; // 500K tokens/day
      const monthlyCost = calculateMonthlyCost(tokensPerDay, claude.costPer1M);
      const yearlyCost = monthlyCost * 12;

      // 500K * 30 = 15M tokens/month
      // 15M * $3/1M = $45/month
      // $45 * 12 = $540/year
      expect(monthlyCost).toBe(45);
      expect(yearlyCost).toBe(540);
    }
  });

  it('should handle large token volumes', () => {
    const model = modelsData.models[0];
    const largeTokensPerDay = 10_000_000; // 10M tokens/day
    const monthlyCost = calculateMonthlyCost(largeTokensPerDay, model.costPer1M);

    expect(monthlyCost).toBeGreaterThan(0);
    expect(monthlyCost).toBeLessThan(Infinity);
    expect(Number.isNaN(monthlyCost)).toBe(false);
  });
});

describe('Self-Hosting Cost Calculations', () => {
  const calculateSelfHostingMonthlyCost = (
    upfrontCost: number,
    monthlyPower: number,
    powerCostPerKwh: number,
    depreciationYears: number,
    maintenanceMonthly: number,
    internetMonthly: number
  ) => {
    const monthlyPowerCost = monthlyPower * powerCostPerKwh;
    const monthlyDepreciation = upfrontCost / (depreciationYears * 12);
    return monthlyPowerCost + monthlyDepreciation + maintenanceMonthly + internetMonthly;
  };

  it('should calculate RTX 4090 monthly cost correctly', () => {
    const rtx4090 = costData.selfHostingCosts.hardware.find(h => h.name === 'RTX 4090 (24GB)');
    expect(rtx4090).toBeDefined();

    if (rtx4090) {
      const monthlyCost = calculateSelfHostingMonthlyCost(
        rtx4090.upfrontCost,
        rtx4090.monthlyPower,
        costData.selfHostingCosts.operationalCosts.powerCostPerKwh,
        costData.selfHostingCosts.operationalCosts.depreciationYears,
        costData.selfHostingCosts.operationalCosts.maintenanceMonthly,
        costData.selfHostingCosts.operationalCosts.internetMonthly
      );

      // Should be reasonable monthly cost
      expect(monthlyCost).toBeGreaterThan(0);
      expect(monthlyCost).toBeLessThan(1000); // Sanity check
    }
  });

  it('should show higher cost for more expensive hardware', () => {
    const rtx4090 = costData.selfHostingCosts.hardware.find(h => h.name === 'RTX 4090 (24GB)');
    const h100 = costData.selfHostingCosts.hardware.find(h => h.name === 'H100 80GB');

    expect(rtx4090).toBeDefined();
    expect(h100).toBeDefined();

    if (rtx4090 && h100) {
      const rtx4090Cost = calculateSelfHostingMonthlyCost(
        rtx4090.upfrontCost,
        rtx4090.monthlyPower,
        costData.selfHostingCosts.operationalCosts.powerCostPerKwh,
        costData.selfHostingCosts.operationalCosts.depreciationYears,
        costData.selfHostingCosts.operationalCosts.maintenanceMonthly,
        costData.selfHostingCosts.operationalCosts.internetMonthly
      );

      const h100Cost = calculateSelfHostingMonthlyCost(
        h100.upfrontCost,
        h100.monthlyPower,
        costData.selfHostingCosts.operationalCosts.powerCostPerKwh,
        costData.selfHostingCosts.operationalCosts.depreciationYears,
        costData.selfHostingCosts.operationalCosts.maintenanceMonthly,
        costData.selfHostingCosts.operationalCosts.internetMonthly
      );

      expect(h100Cost).toBeGreaterThan(rtx4090Cost);
    }
  });
});

describe('Usage Presets', () => {
  it('should have hobby preset with reasonable values', () => {
    const hobby = costData.usagePresets.find(p => p.id === 'hobby');
    expect(hobby).toBeDefined();

    if (hobby) {
      expect(hobby.tokensPerDay).toBeLessThan(100000);
      expect(hobby.requestsPerDay).toBeLessThan(100);
    }
  });

  it('should have enterprise preset with high values', () => {
    const enterprise = costData.usagePresets.find(p => p.id === 'enterprise');
    expect(enterprise).toBeDefined();

    if (enterprise) {
      expect(enterprise.tokensPerDay).toBeGreaterThan(1000000);
      expect(enterprise.requestsPerDay).toBeGreaterThan(1000);
    }
  });

  it('should have custom preset with zero defaults', () => {
    const custom = costData.usagePresets.find(p => p.id === 'custom');
    expect(custom).toBeDefined();

    if (custom) {
      expect(custom.tokensPerDay).toBe(0);
      expect(custom.requestsPerDay).toBe(0);
    }
  });
});
