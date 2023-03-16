export function friendship_rejection_letter(user, server_name) {
    const letter = 
`
Dear ${user},

We have completed our review of this year's highly competitive applicant pool and regret to inform you that we are unable to offer you friendship to **${server_name}** for the upcoming friendship year.

The Friendship Committee carefully considered your application and recognized the many achievements and strengths you have demonstrated throughout your friendships and personal pursuits. However, with so many talented applicants, we are unable to offer admission to all who apply.

We want to assure you that our decision was made with the utmost care and attention. We wish you all the best as you continue to pursue your friendships and personal goals.

Thank you for your interest in **${server_name}**. We appreciate the time and effort you invested in your application.

Sincerely,

__${process.env.BOT_NAME}__
**${server_name}** Friendship Committee
`
    return letter;
}

export function termination_letter(user, server_name) {
    const today = `${new Date().toISOString().slice(0, 10)}`
    const letter = 
`
Dear ${user}

I regret to inform you that your employment with ${server_name} is being terminated, effective ${today}. This decision is due to **BEING A CRIMINAL**, which has resulted in a reduction of our workforce.

As a result of this termination, you will receive $0, as well as any unused vacation time and benefits owed to you. Please return all company property, including your laptop and company phone, by ${today}.

We understand that this news may be difficult for you, and we want to assure you that we are committed to providing you with assistance in finding new employment. If you have any questions or concerns, please don't hesitate to contact __${process.env.BOT_NAME}__ at **${server_name}**.

We wish you all the best in your future endeavors.

Sincerely,

__${process.env.BOT_NAME}__
**${server_name}**
`
    return letter
}

export function angry_emojis(arrest_count) {
    let n = Math.min(Math.max(1, 2**(arrest_count - 10)), 1500)
    let emoji = '😡'
    return emoji.repeat(n)
}