/**
 * PolicyModal — Displays Terms of Service or Privacy Policy in a scrollable modal sheet.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';

export type PolicyType = 'terms' | 'privacy';

interface PolicyModalProps {
  visible: boolean;
  type: PolicyType;
  onClose: () => void;
}

const TERMS_CONTENT = `TERMS OF SERVICE
Last updated: July 2026

1. Acceptance of Terms
By creating an account or using Assignment Guy ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.

2. Purpose
Assignment Guy is a community-driven platform for students to share, discuss, and access academic assignment information. The App is intended for educational support only.

3. User Responsibilities
- You must be a currently enrolled student or academic professional to use the App.
- You are responsible for the accuracy of content you upload or share.
- You must not upload content that infringes any copyright, is plagiarised, or violates academic integrity policies at your institution.
- You must not use the App for commercial purposes, cheating, or submitting others' work as your own.

4. Community Standards
- Treat all members with respect.
- Do not harass, bully, or discriminate against other users.
- Report inaccurate or harmful content using the Report function.

5. Content Ownership
- You retain ownership of content you upload.
- By uploading content, you grant Assignment Guy a non-exclusive licence to display and distribute that content within the platform for educational purposes.

6. Verification System
Content may be marked as "Unverified", "Community Confirmed", or "Trusted Contributor Verified". These labels reflect community consensus and are not guarantees of academic accuracy.

7. Limitation of Liability
Assignment Guy is provided "as is". We are not liable for errors in user-submitted content, academic outcomes, or any direct or indirect damages arising from use of the App.

8. Termination
We reserve the right to suspend or terminate accounts that violate these Terms at our discretion.

9. Changes to Terms
We may update these Terms at any time. Continued use of the App after changes constitutes acceptance of the updated Terms.

10. Contact
For questions about these Terms, contact support through the App's feedback feature.`;

const PRIVACY_CONTENT = `PRIVACY POLICY
Last updated: July 2026

1. Information We Collect
- Account information: email address, display name, and password (stored securely via Supabase Auth).
- Profile information: your school, department, academic level, and selected courses.
- Content you upload: assignment titles, descriptions, attachments, and context notes.
- Usage data: interactions within the App (e.g., courses viewed, assignments accessed).

2. How We Use Your Information
- To provide and improve the Assignment Guy platform.
- To personalise your feed and show assignments relevant to your courses.
- To send important account notifications (e.g., email confirmation, password reset).
- To enforce our Terms of Service and community standards.

3. Information Sharing
- We do not sell your personal data to third parties.
- Your display name and uploaded content are visible to other users of the App.
- Your email address is never publicly displayed.
- We may share data with service providers (e.g., Supabase for authentication and database) who are bound by confidentiality agreements.

4. Data Storage and Security
- All data is stored on secure cloud infrastructure.
- Passwords are never stored in plain text — they are managed by Supabase Auth.
- We implement reasonable technical safeguards to protect your data.

5. Your Rights
- You may request deletion of your account and personal data at any time through the App's settings.
- You may update your profile information at any time.
- You may request a copy of the data we hold about you by contacting us through the App.

6. Cookies and Analytics
The App may use anonymous analytics to understand feature usage. No personally identifiable information is included in analytics data.

7. Children's Privacy
Assignment Guy is not intended for users under 13 years of age. We do not knowingly collect data from children.

8. Changes to This Policy
We may update this Privacy Policy periodically. We will notify you of significant changes via the App.

9. Contact
For privacy inquiries, use the feedback feature within the App.`;

export function PolicyModal({ visible, type, onClose }: PolicyModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close" accessibilityRole="button">
            <Ionicons name="close" size={24} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.body, { color: colors.foreground }]}>{content}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
});
