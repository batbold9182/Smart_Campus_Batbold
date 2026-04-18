import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AppInput, AppModal } from "../ui";

export type RecipientOption = {
  id: string;
  name: string;
  email: string;
  identifier: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  recipientSearch: string;
  setRecipientSearch: (v: string) => void;
  filteredOptions: RecipientOption[];
  selectedRecipientId: string;
  onSelect: (id: string) => void;
};

export default function RecipientPickerModal({
  open,
  onClose,
  recipientSearch,
  setRecipientSearch,
  filteredOptions,
  selectedRecipientId,
  onSelect,
}: Props) {
  return (
    <AppModal open={open} onClose={onClose} layout="bottom">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[17px] font-bold text-app-text">Select Recipient</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[14px] font-semibold text-app-primary">Done</Text>
        </TouchableOpacity>
      </View>

      <AppInput
        value={recipientSearch}
        onChangeText={setRecipientSearch}
        placeholder="Search by name, email, ID"
        className="mb-3 rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[15px] text-app-text"
      />

      <Text className="mb-3 text-[12px] text-app-muted">
        {filteredOptions.length} result{filteredOptions.length === 1 ? "" : "s"}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredOptions.length === 0 ? (
          <View className="rounded-xl border border-dashed border-app-border bg-app-surface px-4 py-5">
            <Text className="text-center text-[14px] text-app-muted">No recipients match your search.</Text>
          </View>
        ) : (
          filteredOptions.map((recipient) => {
            const active = recipient.id === selectedRecipientId;
            return (
              <TouchableOpacity
                key={recipient.id}
                className={`mb-2 rounded-lg border px-3 py-3 ${
                  active ? "border-app-primary bg-app-primary-bg" : "border-app-border-light bg-app-surface"
                }`}
                onPress={() => onSelect(recipient.id)}
              >
                <Text className={`font-medium ${active ? "text-app-primary-dark" : "text-app-text"}`}>
                  {recipient.name}
                </Text>
                <Text className={`mt-1 text-[13px] ${active ? "text-app-primary-dark" : "text-app-text-subtle"}`}>
                  {recipient.email}
                </Text>
                {recipient.identifier ? (
                  <Text className={`mt-1 text-[12px] ${active ? "text-app-primary-dark" : "text-app-text-subtle"}`}>
                    ID: {recipient.identifier}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </AppModal>
  );
}
