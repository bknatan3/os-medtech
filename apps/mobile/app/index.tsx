import { useEffect, useState } from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { enqueueMutation, initDb, listPendingMutations } from "../src/db/sqlite";
import { syncNow } from "../src/sync/sync-client";

export default function Home() {
  const [status, setStatus] = useState("Inicializando...");
  const [pending, setPending] = useState(0);

  useEffect(() => {
    initDb().then(async () => {
      setStatus("Offline pronto");
      const mutations = await listPendingMutations();
      setPending(mutations.length);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>OS MedTech Mobile</Text>
      <Text style={{ marginTop: 10 }}>Status sync: {status}</Text>
      <Text>Mutacoes pendentes: {pending}</Text>

      <View style={{ marginTop: 20, gap: 12 }}>
        <Button
          title="Criar OS offline"
          onPress={async () => {
            await enqueueMutation("create", "work_order", { id: crypto.randomUUID(), descricaoProblema: "Teste offline" });
            const mutations = await listPendingMutations();
            setPending(mutations.length);
          }}
        />
        <Button
          title="Sincronizar agora"
          onPress={async () => {
            setStatus("Sincronizando...");
            const result = await syncNow();
            setStatus(result ? "Sincronizado" : "Falha no sync");
            const mutations = await listPendingMutations();
            setPending(mutations.length);
          }}
        />
      </View>
    </SafeAreaView>
  );
}
