namespace BundleTransformer.Less
{
	using System;

	using Core.Helpers;

	/// <summary>
	/// LESS-import options
	/// </summary>
	public struct LessImportOptions
	{
		public bool Less;
		public bool Multiple;
		public bool Inline;
		public bool Reference;
		public bool Optional;


		public LessImportOptions(string extension)
		{
			Less = !FileExtensionHelpers.IsCss(extension);
			Multiple = false;
			Inline = false;
			Reference = false;
			Optional = false;
		}


		public override bool Equals(object obj)
		{
			if (!(obj is LessImportOptions))
			{
				return false;
			}

			var otherOptions = (LessImportOptions)obj;
			bool isEquals = (Less.Equals(otherOptions.Less)
				&& Multiple.Equals(otherOptions.Multiple)
				&& Inline.Equals(otherOptions.Inline)
				&& Reference.Equals(otherOptions.Reference)
				&& Optional.Equals(otherOptions.Optional)
			);

			return isEquals;
		}

		public override int GetHashCode()
		{
			return Tuple.Create(Less, Multiple, Inline, Reference, Optional).GetHashCode();
		}

		public static bool operator ==(LessImportOptions x, LessImportOptions y)
		{
			return x.Equals(y);
		}

		public static bool operator !=(LessImportOptions x, LessImportOptions y)
		{
			return !(x.Equals(y));
		}
	}
}