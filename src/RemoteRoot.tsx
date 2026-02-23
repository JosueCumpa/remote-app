import React, {useMemo, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {API_BASE_URL} from './api/config';
import {
  getMyProfile,
  getProtectedMe,
  listUsers,
  loginUser,
  registerUser,
  type AuthPayload,
} from './api/bkApi';

type ActionState = {
  loading: boolean;
  error: string;
  output: string;
};

const initialState: ActionState = {
  loading: false,
  error: '',
  output: '',
};

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export default function RemoteRoot(): React.JSX.Element {
  const [name, setName] = useState('Usuario Mobile');
  const [email, setEmail] = useState('demo.mobile@bk.local');
  const [password, setPassword] = useState('123456');
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [state, setState] = useState<ActionState>(initialState);

  const token = useMemo(() => auth?.token ?? '', [auth]);

  const run = async (fn: () => Promise<unknown>) => {
    setState({loading: true, error: '', output: ''});
    try {
      const data = await fn();
      setState({
        loading: false,
        error: '',
        output: pretty(data),
      });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        output: '',
      });
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Remote App</Text>
        <Text style={styles.subtitle}>Conectado a BK-API: {API_BASE_URL}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Credenciales</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Nombre"
            style={styles.input}
            value={name}
          />
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <View style={styles.buttonGap}>
            <Button
              onPress={() =>
                run(async () => {
                  const data = await registerUser({name, email, password});
                  setAuth(data);
                  return data;
                })
              }
              title="POST /api/auth/register"
            />
          </View>

          <View style={styles.buttonGap}>
            <Button
              onPress={() =>
                run(async () => {
                  const data = await loginUser({email, password});
                  setAuth(data);
                  return data;
                })
              }
              title="POST /api/auth/login"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Endpoints protegidos</Text>
          <Text style={styles.muted}>
            Token: {token ? `${token.slice(0, 24)}...` : 'No autenticado'}
          </Text>

          <View style={styles.buttonGap}>
            <Button
              disabled={!token}
              onPress={() => run(() => getMyProfile(token))}
              title="GET /api/users/me"
            />
          </View>

          <View style={styles.buttonGap}>
            <Button
              disabled={!token}
              onPress={() => run(() => listUsers(token))}
              title="GET /api/users"
            />
          </View>

          <View style={styles.buttonGap}>
            <Button
              disabled={!token}
              onPress={() => run(() => getProtectedMe(token))}
              title="GET /api/protected/me"
            />
          </View>
        </View>

        {state.loading ? <Text style={styles.loading}>Procesando...</Text> : null}
        {state.error ? <Text style={styles.error}>{state.error}</Text> : null}
        {state.output ? <Text style={styles.output}>{state.output}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe2ef',
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    color: '#111827',
  },
  buttonGap: {
    marginTop: 8,
  },
  muted: {
    fontSize: 12,
    color: '#6b7280',
  },
  loading: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  output: {
    fontFamily: 'monospace',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
  },
});
