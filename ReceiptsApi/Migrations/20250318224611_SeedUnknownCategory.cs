using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebServer.Migrations
{
    /// <inheritdoc />
    public partial class SeedUnknownCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptLineItems_LineItems_ItemId",
                table: "ReceiptLineItems");

            migrationBuilder.DropColumn(
                name: "TempProperty",
                table: "ReceiptLineItems");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "ReceiptLineItems",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "ItemId",
                table: "ReceiptLineItems",
                newName: "LineItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ReceiptLineItems_ItemId",
                table: "ReceiptLineItems",
                newName: "IX_ReceiptLineItems_LineItemId");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "LineItems",
                type: "integer",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "CategoryId", "CategoryName" },
                values: new object[] { 1, "Unknown" });

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptLineItems_LineItems_LineItemId",
                table: "ReceiptLineItems",
                column: "LineItemId",
                principalTable: "LineItems",
                principalColumn: "LineItemId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptLineItems_LineItems_LineItemId",
                table: "ReceiptLineItems");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 1);

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "ReceiptLineItems",
                newName: "price");

            migrationBuilder.RenameColumn(
                name: "LineItemId",
                table: "ReceiptLineItems",
                newName: "ItemId");

            migrationBuilder.RenameIndex(
                name: "IX_ReceiptLineItems_LineItemId",
                table: "ReceiptLineItems",
                newName: "IX_ReceiptLineItems_ItemId");

            migrationBuilder.AddColumn<string>(
                name: "TempProperty",
                table: "ReceiptLineItems",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "LineItems",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 1);

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptLineItems_LineItems_ItemId",
                table: "ReceiptLineItems",
                column: "ItemId",
                principalTable: "LineItems",
                principalColumn: "LineItemId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
