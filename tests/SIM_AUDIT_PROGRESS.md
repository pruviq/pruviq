# PRUVIQ Simulator QA — 진행 상황 (2026-03-11)

## 완료된 작업

### Phase 1: 핵심 계산 버그 수정 ✅ (PR#322)
- B1: MDD > 100% → % of peak (7곳)
- B2: engine_fast.py MDD → % of peak
- B3: /simulate/compare MDD → % of peak
- B3b: monte_carlo.py MDD → % of peak
- B3c: generate_demo_data.py MDD → % of peak
- B4: Calmar CAGR → compound CAGR (4곳)
- B4b: engine.py MDD → % of peak

### Phase 2: 전문가 감사 기반 수정 ✅ (PR#331)
- DSR: daily Sharpe 사용 (annualized 아닌)
- DSR: kurtosis (krt/4) → ((krt+2)/4) per Lo (2002)
- DSR: E-M denominator ln(N), γ/√(2lnN) 항 추가
- OOS: per-trade 정규화 (total → avg)
- scipy fallback: A&S CDF (|err|<7.5e-8)
- MC bootstrap MDD: 절대값 → % of peak
- 복리 UX: All/TopN/Select 모드 전체 허용
- 프리셋 ID: oversold → overbought (4파일)
- 경고: leverage×SL>100% 청산 리스크
- 라벨: "Edge=X/16" → "Score=X/16"
- QA 인프라: sim_audit.py + ground_truth dataset

### Phase 3: WARN 해소 + 기능 추가 (진행 중)
| # | 항목 | 상태 |
|---|------|------|
| W1 | 동적 슬리피지 (3-tier by market cap) | 🔄 에이전트 진행 중 |
| W2 | Sharpe/Sortino √365 라벨 | ✅ ResultsCard 수정 |
| W3 | <100 거래 경고 | ✅ /backtest warnings 추가 |
| W4 | Sharpe > 3 과적합 경고 | ✅ /backtest warnings 추가 |
| W5 | 시장 체제별 성과 분리 | 🔄 에이전트 진행 중 |
| W6 | 생존 편향 고지 | ✅ ResultsCard + /backtest warnings |
| W7 | MDD > 100% cap | ✅ 모든 엔진 cap 100% |
| W8 | PF ∞ 표시 | ✅ formatPF() + 6개 컴포넌트 |
| S1 | timeframe × max_bars 경고 | ✅ /backtest warnings 추가 |
| S2 | 누락 심볼 경고 | ✅ /backtest warnings 추가 |
| S3 | Walk-Forward 네이밍 정정 | ✅ "Anchored Walk-Forward" |
| S4 | grade_details 라벨 수정 | ✅ "Score=X/16" (Phase 2에서 완료) |

## QA 결과

### 최신 실행 (Phase 2 배포 후)
- **87 PASS / 0 FAIL / 8 WARN**
- WARN 중 6개 해소 예정 (Phase 3)

## 검증 인프라
```
tests/
├── sim_audit.py              # 메인 QA 스크립트 (4-layer)
├── SIM_AUDIT_PROGRESS.md     # 이 파일
└── ground_truth/
    ├── README.md
    └── formulas.json         # 수기 계산 정답 데이터
```

## 에이전트 현황
- `simulator-qa`: `/Users/jplee/Desktop/autotrader/.claude/agents/simulator-qa.md`
- `/sim-audit` 스킬: `/Users/jplee/.claude/skills/sim-audit/instructions.md`
