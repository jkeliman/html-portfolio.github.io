# Contact form: Power Automate flow

The form in `public/contact.html` posts JSON to a Power Automate flow. `contact.js` holds the flow URL in `ENDPOINT`. While `ENDPOINT` is empty, the form opens the visitor's mail app instead.

## Build the flow

Sign in to Power Automate with a PNAO account. Choose Create, Instant cloud flow, and the trigger **When an HTTP request is received**.

1. **Trigger.** Set "Who can trigger the flow" to **Anyone**. The page runs in a public browser, so this is required. Leave the request body schema empty. The page sends `text/plain` to avoid a CORS preflight.
2. **Parse JSON.** Content: `json(triggerBody())`. Schema:

   ```json
   {
     "type": "object",
     "properties": {
       "name": { "type": "string" },
       "email": { "type": "string" },
       "message": { "type": "string" },
       "page": { "type": "string" }
     }
   }
   ```

   If this step fails on a test, use `json(string(triggerBody()))` instead.
3. **Condition (validate again).** The browser checks are a convenience, not protection. Continue only when all are true:
   - `length(body('Parse_JSON')?['name'])` is between 1 and 100
   - `length(body('Parse_JSON')?['message'])` is between 10 and 2000
   - `body('Parse_JSON')?['email']` contains `@`
4. **Send an email (V2)** in the Yes branch.
   - To: `john@pnatuna.com` (fixed, never taken from the request)
   - Subject: `Portfolio message from ` plus the name
   - Body: name, email and message as plain text. Turn off "Is HTML" so a hostile message cannot inject markup.
   - Reply-To: the visitor's email, so you can answer with one click.
5. **Response** in both branches.
   - Yes: status `202`. No: status `400`.
   - Header on both: `Access-Control-Allow-Origin` = `https://jkeliman.github.io`

## Connect the page

1. Save the flow and copy the **HTTP POST URL** from the trigger.
2. Paste it into `ENDPOINT` in `contact.js`.
3. Commit and push.

## Protect it

- The URL contains a signature key and is visible in the page source. Treat it as public. Anyone holding it can post to the flow.
- Turn on the flow's concurrency limit (trigger Settings, Concurrency Control, degree 1) and watch the run history for floods.
- If the URL leaks into abuse, open the trigger and choose Regenerate key. Then paste the new URL into `contact.js`.
- The hidden `website` field and the three-second minimum are cheap bot filters. They do not stop a determined sender.
