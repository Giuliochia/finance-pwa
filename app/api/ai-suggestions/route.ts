import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { summary, expenses, savingsTarget } = await request.json()

  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Grok API key non configurata' }, { status: 500 })

  const prompt = `Sei un consulente finanziario personale. Analizza questa situazione finanziaria mensile e suggerisci tagli specifici alle spese variabili per raggiungere l'obiettivo di risparmio.

DATI DEL MESE:
- Entrate totali: €${summary.total_income}
- Uscite totali: €${summary.total_expense}
- Saldo attuale: €${summary.balance}
- Obiettivo risparmio mensile: €${savingsTarget}
- Gap da colmare: €${Math.max(0, savingsTarget - summary.balance)}

SPESE PER CATEGORIA:
${expenses.map((e: { category: string; amount: number }) => `- ${e.category}: €${e.amount.toFixed(2)}`).join('\n')}

Fornisci 3-5 suggerimenti concreti e specifici in italiano. Per ogni suggerimento indica:
1. La categoria da tagliare
2. Il taglio suggerito in euro
3. Come farlo praticamente

Sii diretto, pratico e incoraggiante. Rispondi in formato JSON con questo schema:
{
  "summary": "frase di sintesi della situazione",
  "suggestions": [
    { "category": "nome categoria", "cut": 50, "tip": "consiglio pratico" }
  ]
}`

  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Grok error: ${err}` }, { status: 500 })
    }

    const data = await res.json()
    const content = JSON.parse(data.choices[0].message.content)
    return NextResponse.json(content)
  } catch (e) {
    return NextResponse.json({ error: 'Errore nella chiamata AI' }, { status: 500 })
  }
}
