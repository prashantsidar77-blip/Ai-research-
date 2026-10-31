package com.jarvis.assistant.service

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * JarvisAccessibilityService:
 * Optional, user-approved screen assistance service.
 *
 * Strict Privacy Protections Enforced:
 * 1. Passwords (InputType.TYPE_TEXT_VARIATION_PASSWORD) are NEVER read or cached.
 * 2. Banking, UPI, and Payment transaction screens are strictly ignored.
 * 3. Never auto-enabled; requires explicit system settings activation by the user.
 * 4. Only assists with user-confirmed screen readout upon active request.
 */
class JarvisAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        // Safety Filter: Check for sensitive password/credential fields
        val source = event.source ?: return
        if (source.isPassword) {
            source.recycle()
            return
        }

        // Sensitive package exclusions (Banking, Google Pay, PhonePe, Paytm, etc.)
        val packageName = event.packageName?.toString() ?: ""
        if (isSensitiveFinancialPackage(packageName)) {
            source.recycle()
            return
        }

        // Only process if user actively invoked screen query
        source.recycle()
    }

    private fun isSensitiveFinancialPackage(pkg: String): Boolean {
        val sensitivePatterns = listOf(
            "bank", "upi", "paytm", "phonepe", "gpay", "bhim", "cred", "wallet"
        )
        return sensitivePatterns.any { pkg.lowercase().contains(it) }
    }

    override fun onInterrupt() {
        // Called when system halts feedback
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isRunning = true
    }

    override fun onDestroy() {
        isRunning = false
        super.onDestroy()
    }

    companion object {
        var isRunning = false
            private set
    }
}
