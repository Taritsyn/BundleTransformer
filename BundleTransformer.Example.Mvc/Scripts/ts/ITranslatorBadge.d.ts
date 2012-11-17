module TranslatorBadges {
    export interface ITranslatorBadge {
        getText(): string;
        setText(text: string): void;
        show(): void;
        hide(): void;
    }
}