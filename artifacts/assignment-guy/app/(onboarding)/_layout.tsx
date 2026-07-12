import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="school" />
      <Stack.Screen name="department" />
      <Stack.Screen name="level" />
      <Stack.Screen name="courses" />
    </Stack>
  );
}
