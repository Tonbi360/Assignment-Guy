import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
