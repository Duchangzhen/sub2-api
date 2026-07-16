//go:build unit

package service

import (
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestBuildEmailMessageAddsDeliverabilityHeaders(t *testing.T) {
	sentAt := time.Date(2026, time.July, 17, 10, 30, 0, 0, time.FixedZone("CST", 8*60*60))
	message := buildEmailMessage(&SMTPConfig{
		From:     "sender@163.com",
		FromName: "ACAIM",
	}, "user@qq.com", "邮箱验证码", "<p>123456</p>", sentAt)

	require.Contains(t, message, "Date: Fri, 17 Jul 2026 10:30:00 +0800\r\n")
	require.Contains(t, message, "Message-ID: <")
	require.Contains(t, message, "@163.com>\r\n")
	require.Contains(t, message, "From: \"ACAIM\" <sender@163.com>\r\n")
	require.Contains(t, message, "To: user@qq.com\r\n")
	require.Contains(t, message, "Subject: =?UTF-8?q?")
	require.Contains(t, message, "Content-Transfer-Encoding: 8bit\r\n")
	require.True(t, strings.HasSuffix(message, "\r\n\r\n<p>123456</p>"))
}
