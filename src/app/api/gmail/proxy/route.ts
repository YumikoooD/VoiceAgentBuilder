import { NextRequest, NextResponse } from 'next/server';

// Proxy route to call Gmail API securely
// This keeps the access token handling on the server side
export async function POST(request: NextRequest) {
  try {
    const { action, accessToken, params } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let result;

    switch (action) {
      case 'list_unread': {
        const limit = params?.limit || 10;
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=${limit}`,
          { headers }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({ error: data.error.message }, { status: data.error.code });
        }

        // Fetch details for each message
        const messages = await Promise.all(
          (data.messages || []).map(async (msg: { id: string }) => {
            const msgResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
              { headers }
            );
            const msgData = await msgResponse.json();
            
            const getHeader = (name: string) =>
              msgData.payload?.headers?.find((h: any) => h.name === name)?.value || '';

            return {
              id: msg.id,
              from: getHeader('From'),
              subject: getHeader('Subject'),
              date: getHeader('Date'),
              snippet: msgData.snippet,
            };
          })
        );

        result = { messages, count: data.resultSizeEstimate || messages.length };
        break;
      }

      case 'read_email': {
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${params.email_id}?format=full`,
          { headers }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({ error: data.error.message }, { status: data.error.code });
        }

        const getHeader = (name: string) =>
          data.payload?.headers?.find((h: any) => h.name === name)?.value || '';

        // Decode body
        let body = '';
        if (data.payload?.body?.data) {
          body = Buffer.from(data.payload.body.data, 'base64').toString('utf-8');
        } else if (data.payload?.parts) {
          const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        }

        result = {
          id: data.id,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          date: getHeader('Date'),
          body: body || data.snippet,
        };
        break;
      }

      case 'send_email': {
        const { to, subject, body } = params;
        
        const emailContent = [
          `To: ${to}`,
          `Subject: ${subject}`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          body,
        ].join('\r\n');

        const encodedMessage = Buffer.from(emailContent)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const response = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ raw: encodedMessage }),
          }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({ error: data.error.message }, { status: data.error.code });
        }

        result = { success: true, messageId: data.id, message: `Email sent to ${to}` };
        break;
      }

      case 'delete_email': {
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${params.email_id}/trash`,
          { method: 'POST', headers }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({ error: data.error.message }, { status: data.error.code });
        }

        result = { success: true, message: `Email ${params.email_id} moved to trash` };
        break;
      }

      case 'create_draft': {
        const { to, subject, body } = params;
        
        const emailContent = [
          to ? `To: ${to}` : '',
          `Subject: ${subject || '(No Subject)'}`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          body || '',
        ].filter(Boolean).join('\r\n');

        const encodedMessage = Buffer.from(emailContent)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const response = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ message: { raw: encodedMessage } }),
          }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({ error: data.error.message }, { status: data.error.code });
        }

        result = { success: true, draftId: data.id, message: 'Draft created successfully' };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gmail proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gmail API error' },
      { status: 500 }
    );
  }
}

