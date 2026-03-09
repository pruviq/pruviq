# Heartbeat Tasks - PRUVIQ 24/7 Monitoring

## Priority 0: Critical Health
- curl https://api.pruviq.com/coins (expect 200, coins >= 500)
- curl https://pruviq.com (expect 200)
- curl http://localhost:8080/health (expect 200)

## Priority 1: Data Freshness
- Check market.json age < 4 hours
- Check coins.json age < 1 hour
- If stale > 6h: trigger ~/scripts/claude-auto/data-healer.sh

## Priority 2: LaunchAgents (24 total)
- launchctl list | grep pruviq | wc -l (expect 24)
- Check for crash loops (exit code -9 = crashed)
- Alert if any agent missing

## Priority 3: AutoTrader
- ssh -p 2222 root@167.172.81.145 docker ps (expect Up healthy)

## Priority 4: Tokens and Auth
- claude auth status (expect loggedIn: true)
- Check wrangler token validity
- Check GitHub CLI auth

## Priority 5: Performance
- npm run build time < 3 minutes
- API response time < 500ms
- Disk usage < 80 percent
