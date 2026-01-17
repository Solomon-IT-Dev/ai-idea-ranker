import 'dotenv/config'

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

const email = process.env.TEST_USER_EMAIL!
const password = process.env.TEST_USER_PASSWORD!

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  }

  // This is the Bearer token you need for API calls.
  // eslint-disable-next-line no-console
  console.log(data.session?.access_token)
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
