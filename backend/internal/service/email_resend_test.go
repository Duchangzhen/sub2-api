//go:build unit

package service

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSendTextEmailUsesConfiguredResendProvider(t *testing.T) {
	var received resendEmailRequest
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "Bearer test-key", r.Header.Get("Authorization"))
		require.Equal(t, "application/json", r.Header.Get("Content-Type"))
		require.NoError(t, json.NewDecoder(r.Body).Decode(&received))
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"id":"email-id"}`))
	}))
	t.Cleanup(server.Close)
	t.Setenv("RESEND_API_KEY", "test-key")
	t.Setenv("RESEND_FROM", "ACAIM <noreply@acaim.cn>")
	t.Setenv("RESEND_API_URL", server.URL)

	service := &EmailService{}
	require.NoError(t, service.SendTextEmail(t.Context(), "user@qq.com", "邮箱验证码", "验证码：123456"))
	require.Equal(t, "ACAIM <noreply@acaim.cn>", received.From)
	require.Equal(t, []string{"user@qq.com"}, received.To)
	require.Equal(t, "邮箱验证码", received.Subject)
	require.Equal(t, "验证码：123456", received.Text)
	require.Empty(t, received.HTML)
}

func TestSendEmailReportsResendAPIError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, `{"message":"domain is not verified"}`, http.StatusUnprocessableEntity)
	}))
	t.Cleanup(server.Close)
	t.Setenv("RESEND_API_KEY", "test-key")
	t.Setenv("RESEND_FROM", "ACAIM <noreply@acaim.cn>")
	t.Setenv("RESEND_API_URL", server.URL)

	service := &EmailService{}
	err := service.SendEmail(t.Context(), "user@qq.com", "Subject", "<p>Body</p>")
	require.ErrorContains(t, err, "resend returned status 422")
}
