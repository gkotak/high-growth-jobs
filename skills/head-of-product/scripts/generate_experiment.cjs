const fs = require('fs');

// Usage: node generate_experiment.js "Hypothesis" "Metric" "Method"

const hypothesis = process.argv[2] || "We believe [User] has [Problem]";
const metric = process.argv[3] || "Conversion Rate > 10%";
const method = process.argv[4] || "Wizard of Oz / Concierge";

console.log(`
# 🧪 New Experiment Design

| Component | Description |
| :--- | :--- |
| **Hypothesis** | ${hypothesis} |
| **Method** | ${method} |
| **Success Metric** | ${metric} |
| **Fail Condition** | < ${metric} |
| **Cost (Time/$$)** | TBD |
| **Owner** | Product |

## Next Steps
1. [ ] Define the "Concierge" script.
2. [ ] Recruit 3 participants.
3. [ ] Run test manually.
4. [ ] Review results.
`);
